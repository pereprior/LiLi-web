import type { TaskDate } from '#src/tasks/types/task.types.js';

export function formatTaskDate(value: TaskDate | null): string {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.date.split('-');
  const date = `${day}/${month}/${year}`;
  return value.time === null ? date : `${date} · ${value.time}`;
}
