import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';
import type { TaskDate } from '#src/tasks/types/task-date.type.js';

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

export function isTask(value: unknown): value is Task {
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

export function isTaskList(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask);
}

export function isDeleteResponse(value: unknown): value is { success: true } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === true
  );
}
