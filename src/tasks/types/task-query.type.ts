import type { Task } from '#src/tasks/types/task.type.js';

export type TaskQuery<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string; code: number };

export type QueryResult<T> = {
  key: string;
  result:
    | { status: 'ready'; data: T }
    | { status: 'error'; error: unknown; code: number };
};

export type TaskContext = { task: Task; family: Task[] };
