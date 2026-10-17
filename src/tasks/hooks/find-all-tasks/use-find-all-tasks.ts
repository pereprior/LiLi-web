import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HttpError } from '#src/shared/errors/http.error.js';
import { getErrorMessage } from '#src/shared/http/error-message.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import type { TaskFilters } from '#src/tasks/types/find-task-options.type.js';
import type { Task } from '#src/tasks/types/task.type.js';
import type {
  QueryResult,
  TaskQuery,
} from '#src/tasks/types/task-query.type.js';

export function useFindAllTasks(
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
    void tasksApi.findAll(parsedFilters, controller.signal).then(
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
