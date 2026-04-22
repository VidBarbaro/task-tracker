'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { useBoardStore } from '@/store/boardStore';
import Modal from './Modal';
import LabelPicker from './LabelPicker';

/**
 * 📚 LEARNING: Form State Management
 * 
 * When editing data, we create LOCAL copies of the data:
 * 1. User edits the local copy
 * 2. On save, we update the global store
 * 3. On cancel, we discard local changes
 * 
 * This pattern prevents "half-edited" states in your app.
 */

interface TaskDetailsModalProps {
  task: Task | null;
  columnId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const priorityOptions: { value: Task['priority']; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

export default function TaskDetailsModal({ task, columnId, isOpen, onClose }: TaskDetailsModalProps) {
  const { updateTask, addLabelToTask, removeLabelFromTask } = useBoardStore();

  // Local form state - copies of the task data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [labelIds, setLabelIds] = useState<string[]>([]);

  // Sync local state when task changes (or modal opens)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setLabelIds(task.labelIds || []);
    }
  }, [task]);

  const handleSave = () => {
    if (!task || !title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      labelIds,
    });

    onClose();
  };

  const handleToggleLabel = (labelId: string) => {
    if (labelIds.includes(labelId)) {
      setLabelIds(labelIds.filter(id => id !== labelId));
    } else {
      setLabelIds([...labelIds, labelId]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to save
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!task) return null;

  const createdDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task title..."
            autoFocus
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add a description..."
          />
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Labels
          </label>
          <LabelPicker
            selectedLabelIds={labelIds}
            onToggle={handleToggleLabel}
          />
        </div>

        {/* Priority Select */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPriority(option.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                  priority === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Created: {createdDate}
          </p>
          {columnId && columnId !== 'backlog' && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Column: {columnId}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-zinc-400 text-center">
          Press Ctrl+Enter to save
        </p>
      </div>
    </Modal>
  );
}
