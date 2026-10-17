import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import type { CreateTaskInput } from '#src/tasks/types/input/create-task.input.js';
import type { UpdateTaskDetailsInput } from '#src/tasks/types/input/update-task-details.input.js';
import type { Task } from '#src/tasks/types/task.type.js';
import type {
  TaskDateDraft,
  TaskDraft,
} from '#src/tasks/types/task-form.type.js';

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

export function buildUpdateTaskDetailsInput(
  draft: TaskDraft,
  original: Task,
): UpdateTaskDetailsInput {
  const input: UpdateTaskDetailsInput = {};
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
