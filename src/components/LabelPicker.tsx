'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';

/**
 * 📚 LEARNING: Multi-Select Component Pattern
 * 
 * This component allows selecting multiple labels from a list.
 * Key concepts:
 * 1. Controlled component - parent controls selected values
 * 2. Toggle selection - clicking adds/removes from array
 * 3. Inline creation - add new labels without leaving the picker
 */

interface LabelPickerProps {
  selectedLabelIds: string[];
  onToggle: (labelId: string) => void;
}

// Available colors for new labels
const labelColors = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Gray', value: 'bg-gray-500' },
];

export default function LabelPicker({ selectedLabelIds, onToggle }: LabelPickerProps) {
  const { labels, addLabel } = useBoardStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labelColors[0].value);

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      addLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateLabel();
    } else if (e.key === 'Escape') {
      setNewLabelName('');
      setIsCreating(false);
    }
  };

  const labelList = Object.values(labels);

  return (
    <div className="space-y-2">
      {/* Existing Labels */}
      <div className="flex flex-wrap gap-2">
        {labelList.length === 0 ? (
          <p className="text-sm text-zinc-400">No labels yet</p>
        ) : (
          labelList.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);
            return (
              <button
                key={label.id}
                onClick={() => onToggle(label.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${label.color}`} />
                <span className="text-zinc-700 dark:text-zinc-300">{label.name}</span>
                {isSelected && (
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Create New Label */}
      {isCreating ? (
        <div className="space-y-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Label name..."
            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          {/* Color Picker */}
          <div className="flex flex-wrap gap-1">
            {labelColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setNewLabelColor(color.value)}
                className={`w-6 h-6 rounded-full ${color.value} ${
                  newLabelColor === color.value
                    ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-800'
                    : ''
                }`}
                title={color.name}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim()}
              className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setNewLabelName('');
                setIsCreating(false);
              }}
              className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create new label
        </button>
      )}
    </div>
  );
}
