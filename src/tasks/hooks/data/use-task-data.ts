import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '#src/shared/http/error-message.js';
import { HttpError } from '#src/shared/http/http-client.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import type { Task, TaskFilters } from '#src/tasks/types/task.types.js';

export type TaskQuery<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string; code: number };

type QueryResult<T> = {
  key: string;
  result:
    | { status: 'ready'; data: T }
    | { status: 'error'; error: unknown; code: number };
};

export function useTaskList(
  filters: TaskFilters,
  revision: number,
  onUnauthorized: () => void,
): TaskQuery<Task[]> {
  useTranslation('common');
  const filterKey = JSON.stringify(filters);
  const key = `${revision}:${filterKey}`;
  const [loaded, setLoaded] = useState<QueryResult<Task[]> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const parsedFilters = JSON.parse(filterKey) as TaskFilters;
    void tasksApi.list(parsedFilters, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setLoaded({ key, result: { status: 'ready', data } });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof HttpError && error.status === 401) {
          onUnauthorized();
          return;
        }
        setLoaded({
          key,
          result: {
            status: 'error',
            error,
            code: error instanceof HttpError ? error.status : 0,
          },
        });
      },
    );
    return (): void => controller.abort();
  }, [filterKey, key, onUnauthorized]);

  if (loaded?.key !== key) return { status: 'loading' };
  if (loaded.result.status === 'error')
    return {
      status: 'error',
      message: getErrorMessage(loaded.result.error),
      code: loaded.result.code,
    };
  return loaded.result;
}

export type TaskContext = { task: Task; family: Task[] };

export function useTaskContext(
  uuid: string | null,
  revision: number,
  onUnauthorized: () => void,
): TaskQuery<TaskContext> {
  useTranslation('common');
  const key = `${revision}:${uuid ?? ''}`;
  const [loaded, setLoaded] = useState<QueryResult<TaskContext> | null>(null);

  useEffect(() => {
    if (!uuid) return;
    const controller = new AbortController();
    // Check each read: the other request can fail before a later 401 arrives.
    function checkSession<T>(read: Promise<T>): Promise<T> {
      return read.catch((error: unknown) => {
        if (
          !controller.signal.aborted &&
          error instanceof HttpError &&
          error.status === 401
        )
          onUnauthorized();
        throw error;
      });
    }
    void Promise.all([
      checkSession(tasksApi.get(uuid, controller.signal)),
      checkSession(tasksApi.list({}, controller.signal)),
    ]).then(
      ([task, family]) => {
        if (!controller.signal.aborted)
          setLoaded({
            key,
            result: { status: 'ready', data: { task, family } },
          });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof HttpError && error.status === 401) {
          onUnauthorized();
          return;
        }
        setLoaded({
          key,
          result: {
            status: 'error',
            error,
            code: error instanceof HttpError ? error.status : 0,
          },
        });
      },
    );
    return (): void => controller.abort();
  }, [uuid, key, onUnauthorized]);

  if (loaded?.key !== key) return { status: 'loading' };
  if (loaded.result.status === 'error')
    return {
      status: 'error',
      message: getErrorMessage(loaded.result.error),
      code: loaded.result.code,
    };
  return loaded.result;
}
