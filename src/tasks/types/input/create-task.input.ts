import type { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';

export type CreateTaskInput = {
  name: string;
  priority?: TaskPriority;
  description?: string | null;
  parentUuid?: string | null;
  start?: string | null;
  end?: string | null;
  reminder?: string | null;
};
