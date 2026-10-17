import type { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';

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
