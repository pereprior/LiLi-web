import { i18n } from '#src/shared/i18n/i18n.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';
import type {
  TaskDateDraft,
  TaskDraft,
  TaskFormErrors,
} from '#src/tasks/types/task-form.type.js';

function validateDate(value: TaskDateDraft): string | undefined {
  if (value.date === '') {
    return value.time === ''
      ? undefined
      : i18n.t('tasks:feedback.validation.dayBeforeTime');
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value.date);
  if (match === null) return i18n.t('tasks:feedback.validation.invalidDate');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (year < 1 || day < 1 || day > (daysInMonth[month - 1] ?? 0))
    return i18n.t('tasks:feedback.validation.invalidDate');
  if (value.time !== '' && !/^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(value.time))
    return i18n.t('tasks:feedback.validation.invalidTime');
  return undefined;
}

export function validateTaskDraft(
  draft: TaskDraft,
  original?: Task,
): TaskFormErrors {
  const errors: TaskFormErrors = {};
  if (draft.name.trim() === '')
    errors.name = i18n.t('tasks:feedback.validation.nameRequired');
  for (const field of ['start', 'end', 'reminder'] as const) {
    const error = validateDate(draft[field]);
    if (error !== undefined) errors[field] = error;
  }
  if (original?.status === TaskStatus.SCHEDULED && draft.start.date === '')
    errors.start = i18n.t('tasks:feedback.validation.scheduledStart');

  if (
    errors.start === undefined &&
    errors.end === undefined &&
    draft.start.date !== '' &&
    draft.end.date !== '' &&
    (draft.end.date < draft.start.date ||
      (draft.end.date === draft.start.date &&
        draft.start.time !== '' &&
        draft.end.time !== '' &&
        draft.end.time < draft.start.time))
  ) {
    errors.end = i18n.t('tasks:feedback.validation.endBeforeStart');
  }
  return errors;
}
