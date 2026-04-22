/**
 * 📚 LEARNING: TypeScript Interfaces
 * 
 * Interfaces define the "shape" of your data.
 * This helps catch errors early and provides autocomplete.
 */

export interface Label {
  id: string;
  name: string;
  color: string;  // Tailwind color class like 'bg-red-500'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  labelIds: string[];  // Array of label IDs
  createdAt: Date;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
  labels: Record<string, Label>;  // All available labels
  columnOrder: string[];
  backlogTaskIds: string[];
}
