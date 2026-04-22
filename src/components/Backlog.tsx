'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '@/store/boardStore';
import TaskCard from './TaskCard';

/**
 * 📚 LEARNING: Backlog Component
 * 
 * This is a "container component" - it manages its own state and renders child components.
 * 
 * Key concepts:
 * 1. useDroppable - makes this a valid drop target for drag-and-drop
 * 2. SortableContext - enables sorting within the backlog
 * 3. Conditional rendering - show different UI based on state (isAddingTask)
 */
export default function Backlog() {
  // Get state and actions from our Zustand store
  const { tasks, backlogTaskIds, addBacklogTask, deleteBacklogTask } = useBoardStore();
  
  // Local state for the "add task" form
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Make this component a drop target with id="backlog"
  const { setNodeRef, isOver } = useDroppable({ id: 'backlog' });

  // Get the actual task objects from their IDs
  const backlogTasks = backlogTaskIds
    .map((taskId) => tasks[taskId])
    .filter(Boolean);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addBacklogTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Backlog</h2>
            </div>
            <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {backlogTasks.length}
            </span>
          </>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Collapsed state - just show icon */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 gap-2">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-xs text-zinc-500 font-medium">{backlogTasks.length}</span>
        </div>
      ) : (
        <>
          {/* Tasks list - this is the drop zone */}
          <div
            ref={setNodeRef}
            className={`flex-1 overflow-y-auto p-3 space-y-2 ${
              isOver ? 'bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
          >
            <SortableContext items={backlogTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {backlogTasks.length === 0 ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                  Drag tasks here or add new ones
                </p>
              ) : (
                backlogTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    columnId="backlog"
                    onDelete={() => deleteBacklogTask(task.id)}
                  />
                ))
              )}
            </SortableContext>
          </div>

          {/* Add Task */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
            {isAddingTask ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter task title..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setNewTaskTitle('');
                      setIsAddingTask(false);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Backlog
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
