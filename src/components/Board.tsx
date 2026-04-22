'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '@/store/boardStore';
import Column from './Column';
import TaskCard from './TaskCard';
import Backlog from './Backlog';

/**
 * 📚 LEARNING: Board Component (Main Container)
 * 
 * This is the main component that orchestrates the entire Kanban board.
 * It handles:
 * 1. DndContext - wraps everything to enable drag-and-drop
 * 2. Layout - sidebar (backlog) + main area (columns)
 * 3. Drag events - onDragStart, onDragOver, onDragEnd
 */
export default function Board() {
  const { 
    columns, 
    tasks, 
    columnOrder, 
    backlogTaskIds,
    addColumn, 
    moveTask,
    moveFromBacklog,
    moveToBacklog,
    reorderBacklog,
  } = useBoardStore();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * 📚 LEARNING: Finding where a task lives
   * 
   * A task can be in:
   * 1. A column (returns the column ID)
   * 2. The backlog (returns 'backlog')
   * 3. Nowhere (returns undefined)
   */
  const findColumnByTaskId = (taskId: string): string | undefined => {
    // Check if it's in the backlog
    if (backlogTaskIds.includes(taskId)) {
      return 'backlog';
    }
    // Check columns
    return Object.keys(columns).find((columnId) =>
      columns[columnId].taskIds.includes(taskId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  /**
   * 📚 LEARNING: handleDragOver
   * 
   * This fires continuously while dragging. We use it to:
   * - Move tasks between containers in real-time (smooth UX)
   * - Handle backlog ↔ column transfers
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnByTaskId(activeId);
    let overColumnId = findColumnByTaskId(overId);

    // If hovering over a column or backlog directly
    if (!overColumnId) {
      if (columns[overId]) {
        overColumnId = overId;
      } else if (overId === 'backlog') {
        overColumnId = 'backlog';
      }
    }

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) return;

    // Handle different transfer scenarios
    if (activeColumnId === 'backlog' && overColumnId !== 'backlog') {
      // Moving FROM backlog TO a column
      const overColumn = columns[overColumnId];
      const overIndex = overColumn.taskIds.indexOf(overId);
      const newIndex = overIndex >= 0 ? overIndex : overColumn.taskIds.length;
      moveFromBacklog(activeId, overColumnId, newIndex);
    } else if (activeColumnId !== 'backlog' && overColumnId === 'backlog') {
      // Moving FROM a column TO backlog
      moveToBacklog(activeId, activeColumnId);
    } else if (activeColumnId !== 'backlog' && overColumnId !== 'backlog') {
      // Moving between columns (not involving backlog)
      const overColumn = columns[overColumnId];
      const overIndex = overColumn.taskIds.indexOf(overId);
      const newIndex = overIndex >= 0 ? overIndex : overColumn.taskIds.length;
      moveTask(activeId, activeColumnId, overColumnId, newIndex);
    }
  };

  /**
   * 📚 LEARNING: handleDragEnd
   * 
   * This fires when you release the mouse. We use it for:
   * - Reordering within the same container
   * - Final cleanup (reset activeTaskId)
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumnId = findColumnByTaskId(activeId);
    let overColumnId = findColumnByTaskId(overId);

    // If dropping on a column or backlog
    if (!overColumnId) {
      if (columns[overId]) {
        overColumnId = overId;
      } else if (overId === 'backlog') {
        overColumnId = 'backlog';
      }
    }

    if (!activeColumnId || !overColumnId) return;

    if (activeColumnId === overColumnId) {
      // Reorder within same container
      if (activeColumnId === 'backlog') {
        // Reorder within backlog
        const oldIndex = backlogTaskIds.indexOf(activeId);
        const newIndex = backlogTaskIds.indexOf(overId);
        if (oldIndex !== newIndex && newIndex >= 0) {
          reorderBacklog(activeId, newIndex);
        }
      } else {
        // Reorder within a column
        const column = columns[activeColumnId];
        const oldIndex = column.taskIds.indexOf(activeId);
        const newIndex = column.taskIds.indexOf(overId);
        if (oldIndex !== newIndex) {
          moveTask(activeId, activeColumnId, activeColumnId, newIndex);
        }
      }
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    } else if (e.key === 'Escape') {
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const activeTask = activeTaskId ? tasks[activeTaskId] : null;
  const activeTaskColumnId = activeTaskId ? findColumnByTaskId(activeTaskId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* 📚 LEARNING: Flex layout with sidebar */}
      <div className="flex h-full">
        {/* Backlog Sidebar */}
        <Backlog />
        
        {/* Main Board Area */}
        <div className="flex gap-4 p-6 overflow-x-auto flex-1">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            if (!column) return null;
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter(Boolean);

            return <Column key={columnId} column={column} tasks={columnTasks} />;
          })}

        {/* Add Column Button */}
        <div className="min-w-72">
          {isAddingColumn ? (
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 space-y-2">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter column title..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumn}
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Add Column
                </button>
                <button
                  onClick={() => {
                    setNewColumnTitle('');
                    setIsAddingColumn(false);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Column
            </button>
          )}
        </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && activeTaskColumnId ? (
          <TaskCard task={activeTask} columnId={activeTaskColumnId} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
