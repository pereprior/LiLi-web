import type { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';

export type UpdateTaskDetailsInput = {
  name?: string;
  priority?: TaskPriority;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  reminder?: string | null;
};
