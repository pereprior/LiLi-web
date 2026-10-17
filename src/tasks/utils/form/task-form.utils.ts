import { i18n } from '#src/shared/i18n/i18n.js';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '#src/tasks/types/task.types.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

export interface TaskDateDraft {
  date: string;
  time: string;
}

export interface TaskDraft {
  name: string;
  description: string | null;
  priority: TaskPriority;
  start: TaskDateDraft;
  end: TaskDateDraft;
  reminder: TaskDateDraft;
}

export interface TaskFormErrors {
  name?: string;
  start?: string;
  end?: string;
  reminder?: string;
}

export function createTaskDraft(task?: Task): TaskDraft {
  return {
    name: task?.name ?? '',
    description: task?.description ?? null,
    priority: task?.priority ?? TaskPriority.MEDIUM,
    start: { date: task?.start?.date ?? '', time: task?.start?.time ?? '' },
    end: { date: task?.end?.date ?? '', time: task?.end?.time ?? '' },
    reminder: {
      date: task?.reminder?.date ?? '',
      time: task?.reminder?.time ?? '',
    },
  };
}

function serializeDate(value: TaskDateDraft): string | null {
  if (value.date === '') return null;
  return value.time === '' ? value.date : `${value.date}T${value.time}`;
}

export function buildCreateTaskInput(
  draft: TaskDraft,
  parentUuid?: string,
): CreateTaskInput {
  const input: CreateTaskInput = {
    name: draft.name.trim(),
    priority: draft.priority,
  };
  if (draft.description !== null) input.description = draft.description;
  if (parentUuid !== undefined) input.parentUuid = parentUuid;
  const start = serializeDate(draft.start);
  const end = serializeDate(draft.end);
  const reminder = serializeDate(draft.reminder);
  if (start !== null) input.start = start;
  if (end !== null) input.end = end;
  if (reminder !== null) input.reminder = reminder;
  return input;
}

export function buildUpdateTaskInput(
  draft: TaskDraft,
  original: Task,
): UpdateTaskInput {
  const input: UpdateTaskInput = {};
  if (draft.name.trim() !== original.name.trim())
    input.name = draft.name.trim();
  if (draft.description !== original.description)
    input.description = draft.description;
  if (draft.priority !== original.priority) input.priority = draft.priority;

  for (const field of ['start', 'end', 'reminder'] as const) {
    const date = serializeDate(draft[field]);
    const previous = original[field];
    const previousDate =
      previous === null
        ? null
        : previous.time === null
          ? previous.date
          : `${previous.date}T${previous.time}`;
    if (date !== previousDate) input[field] = date;
  }
  return input;
}

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
