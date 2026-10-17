import type { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import type { TaskStatus } from '#src/tasks/types/task-status.enum.js';

export type TaskDate = {
  date: string;
  time: string | null;
};

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

export type CreateTaskInput = {
  name: string;
  priority?: TaskPriority;
  description?: string | null;
  parentUuid?: string | null;
  start?: string | null;
  end?: string | null;
  reminder?: string | null;
};

export type UpdateTaskInput = {
  name?: string;
  priority?: TaskPriority;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  reminder?: string | null;
};

export type TaskDateField = 'start' | 'end';
export type TaskSortField = 'createdAt' | 'priority' | 'start' | 'end';
export type TaskSortDirection = 'asc' | 'desc';
export type TaskView = 'overdue' | 'today' | 'upcoming';

export type TaskFilters = {
  status?: TaskStatus[];
  search?: string;
  dateField?: TaskDateField;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: TaskSortField;
  sortDirection?: TaskSortDirection;
  view?: TaskView;
};
