import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Task, Column, Board } from "@/types";

interface BoardState extends Board {
  // Task actions
  addTask: (
    columnId: string,
    title: string,
    description?: string,
    priority?: Task["priority"],
  ) => void;
  addBacklogTask: (
    title: string,
    description?: string,
    priority?: Task["priority"],
  ) => void;
  updateTask: (
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>,
  ) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  deleteBacklogTask: (taskId: string) => void;
  moveTask: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number,
  ) => void;
  moveFromBacklog: (taskId: string, toColumnId: string, newIndex: number) => void;
  moveToBacklog: (taskId: string, fromColumnId: string) => void;
  reorderBacklog: (taskId: string, newIndex: number) => void;
  // Column actions
  addColumn: (title: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumnTitle: (columnId: string, title: string) => void;
}

const initialColumns: Record<string, Column> = {
  todo: { id: "todo", title: "To Do", taskIds: [] },
  "in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
  done: { id: "done", title: "Done", taskIds: [] },
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: initialColumns,
      tasks: {},
      columnOrder: ["todo", "in-progress", "done"],
      backlogTaskIds: [],

      addTask: (columnId, title, description, priority = "medium") => {
        const taskId = uuidv4();
        const newTask: Task = {
          id: taskId,
          title,
          description,
          priority,
          createdAt: new Date(),
        };

        set((state) => ({
          tasks: { ...state.tasks, [taskId]: newTask },
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              taskIds: [...state.columns[columnId].taskIds, taskId],
            },
          },
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], ...updates },
          },
        }));
      },

      deleteTask: (taskId, columnId) => {
        set((state) => {
          const { [taskId]: _, ...remainingTasks } = state.tasks;
          return {
            tasks: remainingTasks,
            columns: {
              ...state.columns,
              [columnId]: {
                ...state.columns[columnId],
                taskIds: state.columns[columnId].taskIds.filter(
                  (id) => id !== taskId,
                ),
              },
            },
          };
        });
      },

      moveTask: (taskId, fromColumnId, toColumnId, newIndex) => {
        set((state) => {
          const fromColumn = state.columns[fromColumnId];
          const toColumn = state.columns[toColumnId];

          const fromTaskIds = fromColumn.taskIds.filter((id) => id !== taskId);

          let toTaskIds: string[];
          if (fromColumnId === toColumnId) {
            toTaskIds = [...fromTaskIds];
            toTaskIds.splice(newIndex, 0, taskId);
          } else {
            toTaskIds = [...toColumn.taskIds];
            toTaskIds.splice(newIndex, 0, taskId);
          }

          return {
            columns: {
              ...state.columns,
              [fromColumnId]: {
                ...fromColumn,
                taskIds: fromColumnId === toColumnId ? toTaskIds : fromTaskIds,
              },
              [toColumnId]: { ...toColumn, taskIds: toTaskIds },
            },
          };
        });
      },

      addColumn: (title) => {
        const columnId = uuidv4();
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { id: columnId, title, taskIds: [] },
          },
          columnOrder: [...state.columnOrder, columnId],
        }));
      },

      deleteColumn: (columnId) => {
        set((state) => {
          const column = state.columns[columnId];
          const { [columnId]: _, ...remainingColumns } = state.columns;

          // Remove all tasks in the column
          const remainingTasks = { ...state.tasks };
          column.taskIds.forEach((taskId) => {
            delete remainingTasks[taskId];
          });

          return {
            columns: remainingColumns,
            tasks: remainingTasks,
            columnOrder: state.columnOrder.filter((id) => id !== columnId),
          };
        });
      },

      updateColumnTitle: (columnId, title) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], title },
          },
        }));
      },

      // Backlog actions
      addBacklogTask: (title, description, priority = "medium") => {
        const taskId = uuidv4();
        const newTask: Task = {
          id: taskId,
          title,
          description,
          priority,
          createdAt: new Date(),
        };

        set((state) => ({
          tasks: { ...state.tasks, [taskId]: newTask },
          backlogTaskIds: [...state.backlogTaskIds, taskId],
        }));
      },

      deleteBacklogTask: (taskId) => {
        set((state) => {
          const { [taskId]: _, ...remainingTasks } = state.tasks;
          return {
            tasks: remainingTasks,
            backlogTaskIds: state.backlogTaskIds.filter((id) => id !== taskId),
          };
        });
      },

      moveFromBacklog: (taskId, toColumnId, newIndex) => {
        set((state) => {
          const toColumn = state.columns[toColumnId];
          const toTaskIds = [...toColumn.taskIds];
          toTaskIds.splice(newIndex, 0, taskId);

          return {
            backlogTaskIds: state.backlogTaskIds.filter((id) => id !== taskId),
            columns: {
              ...state.columns,
              [toColumnId]: { ...toColumn, taskIds: toTaskIds },
            },
          };
        });
      },

      moveToBacklog: (taskId, fromColumnId) => {
        set((state) => {
          const fromColumn = state.columns[fromColumnId];
          return {
            backlogTaskIds: [...state.backlogTaskIds, taskId],
            columns: {
              ...state.columns,
              [fromColumnId]: {
                ...fromColumn,
                taskIds: fromColumn.taskIds.filter((id) => id !== taskId),
              },
            },
          };
        });
      },

      reorderBacklog: (taskId, newIndex) => {
        set((state) => {
          const filtered = state.backlogTaskIds.filter((id) => id !== taskId);
          filtered.splice(newIndex, 0, taskId);
          return { backlogTaskIds: filtered };
        });
      },
    }),
    {
      name: "task-tracker-board",
    },
  ),
);
