import type { TaskFilters } from '#src/tasks/types/find-task-options.type.js';

export function buildTasksPath(filters: TaskFilters): string {
  const parameters = new URLSearchParams();
  const search = filters.search?.trim();
  if (search) parameters.set('search', search);
  if (filters.sortBy) parameters.set('sortBy', filters.sortBy);
  if (filters.sortDirection) {
    parameters.set('sortDirection', filters.sortDirection);
  }

  if (filters.view) {
    parameters.set('view', filters.view);
  } else {
    for (const status of filters.status ?? []) {
      parameters.append('status', status);
    }
    if (filters.dateField) parameters.set('dateField', filters.dateField);
    if (filters.dateFrom) parameters.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) parameters.set('dateTo', filters.dateTo);
  }

  const query = parameters.toString();
  return query ? `/tasks?${query}` : '/tasks';
}
