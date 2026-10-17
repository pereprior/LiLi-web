import { i18n } from '#src/shared/i18n/i18n.js';
import type { TaskDate } from '#src/tasks/types/task.types.js';

export function formatTaskDate(value: TaskDate | null): string {
  if (!value) return i18n.t('tasks:dates.none');
  // A date-only task is a Madrid calendar day, not an instant in the viewer's zone.
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(new Date(`${value.date}T12:00:00Z`));
  return value.time === null ? date : `${date} · ${value.time}`;
}
