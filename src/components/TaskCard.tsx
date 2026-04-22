'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { useBoardStore } from '@/store/boardStore';
import { useState, useRef } from 'react';
import TaskDetailsModal from './TaskDetailsModal';

/**
 * 📚 LEARNING: Distinguishing Click vs Drag
 * 
 * Problem: Both click and drag start with mousedown.
 * Solution: Track if the mouse moved. If it moved > threshold, it's a drag.
 * 
 * We use:
 * - onMouseDown: record starting position
 * - onClick: only open modal if mouse didn't move much
 */

interface TaskCardProps {
  task: Task;
  columnId: string;
  onDelete?: () => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function TaskCard({ task, columnId, onDelete }: TaskCardProps) {
  const { deleteTask, labels } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Track if this is a click or drag
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Track mouse position to distinguish click from drag
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
    const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
    // If mouse moved less than 5px, treat as click
    if (dx < 5 && dy < 5) {
      setIsModalOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (onDelete) {
      onDelete();
    } else {
      deleteTask(task.id, columnId);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex-1">
            {task.title}
          </p>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {task.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labelIds && task.labelIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labelIds.map((labelId) => {
              const label = labels[labelId];
              if (!label) return null;
              return (
                <span
                  key={labelId}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${label.color}`}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={task}
        columnId={columnId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
