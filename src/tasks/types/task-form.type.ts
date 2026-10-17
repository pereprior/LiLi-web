import type { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';

export interface TaskDateDraft {
  date: string;
  time: string;
}

export interface TaskDraft {
  name: string;
  description: string | null;
  priority: TaskPriority;
  start: TaskDateDraft;
  end: TaskDateDraft;
  reminder: TaskDateDraft;
}

export interface TaskFormErrors {
  name?: string;
  start?: string;
  end?: string;
  reminder?: string;
}
