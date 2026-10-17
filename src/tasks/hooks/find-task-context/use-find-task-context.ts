import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HttpError } from '#src/shared/errors/http.error.js';
import { getErrorMessage } from '#src/shared/http/error-message.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import type {
  QueryResult,
  TaskContext,
  TaskQuery,
} from '#src/tasks/types/task-query.type.js';

export function useFindTaskContext(
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
      checkSession(tasksApi.findByUuid(uuid, controller.signal)),
      checkSession(tasksApi.findAll({}, controller.signal)),
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
