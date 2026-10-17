import type { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import type { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { TaskDate } from '#src/tasks/types/task-date.type.js';

export type Task = {
  uuid: string;
  userUuid: string;
  parentUuid: string | null;
  name: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start: TaskDate | null;
  end: TaskDate | null;
  reminder: TaskDate | null;
};
