import { request } from '#src/shared/http/http-client.js';
import type {
  CreateTaskInput,
  Task,
  TaskDate,
  TaskFilters,
  UpdateTaskInput,
} from '#src/tasks/types/task.types.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

function isTaskDate(value: unknown): value is TaskDate | null {
  if (value === null) return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    'date' in value &&
    typeof value.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    'time' in value &&
    (value.time === null ||
      (typeof value.time === 'string' &&
        /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.time)))
  );
}

function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'uuid' in value &&
    typeof value.uuid === 'string' &&
    'userUuid' in value &&
    typeof value.userUuid === 'string' &&
    'parentUuid' in value &&
    (value.parentUuid === null || typeof value.parentUuid === 'string') &&
    'name' in value &&
    typeof value.name === 'string' &&
    'description' in value &&
    (value.description === null || typeof value.description === 'string') &&
    'status' in value &&
    Object.values(TaskStatus).some((status) => status === value.status) &&
    'priority' in value &&
    Object.values(TaskPriority).some(
      (priority) => priority === value.priority,
    ) &&
    'start' in value &&
    isTaskDate(value.start) &&
    'end' in value &&
    isTaskDate(value.end) &&
    'reminder' in value &&
    isTaskDate(value.reminder)
  );
}

function isTaskList(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask);
}

function isDeleteResponse(value: unknown): value is { success: true } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === true
  );
}

function buildTasksPath(filters: TaskFilters): string {
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

export const tasksApi = {
  list(
    this: void,
    filters: TaskFilters = {},
    signal?: AbortSignal,
  ): Promise<Task[]> {
    return request(
      buildTasksPath(filters),
      { ...(signal ? { signal } : {}), cache: 'no-store' },
      isTaskList,
    );
  },

  get(this: void, uuid: string, signal?: AbortSignal): Promise<Task> {
    return request(
      `/tasks/${encodeURIComponent(uuid)}`,
      { ...(signal ? { signal } : {}), cache: 'no-store' },
      isTask,
    );
  },

  create(this: void, input: CreateTaskInput): Promise<Task> {
    const { name, priority, description, parentUuid, start, end, reminder } =
      input;
    return request(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          priority,
          description,
          parentUuid,
          start,
          end,
          reminder,
        }),
      },
      isTask,
    );
  },

  update(this: void, uuid: string, input: UpdateTaskInput): Promise<Task> {
    const { name, priority, description, start, end, reminder } = input;
    return request(
      `/tasks/${encodeURIComponent(uuid)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          priority,
          description,
          start,
          end,
          reminder,
        }),
      },
      isTask,
    );
  },

  updateStatus(this: void, uuid: string, status: TaskStatus): Promise<Task> {
    return request(
      `/tasks/${encodeURIComponent(uuid)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      isTask,
    );
  },

  async remove(this: void, uuid: string): Promise<void> {
    await request(
      `/tasks/${encodeURIComponent(uuid)}`,
      { method: 'DELETE' },
      isDeleteResponse,
    );
  },
};
