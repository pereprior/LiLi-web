import type { Task } from '#src/tasks/types/task.type.js';

export type TaskEditor =
  { kind: 'create'; parentUuid?: string } | { kind: 'edit'; task: Task };
export type TaskConfirmation = { kind: 'delete' | 'cancel'; task: Task };
export type UncertainCreation = { tasks: Task[] | null; checking: boolean };
