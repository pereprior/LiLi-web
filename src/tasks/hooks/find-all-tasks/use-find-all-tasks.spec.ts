import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '#src/shared/errors/http.error.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import { useFindAllTasks } from '#src/tasks/hooks/find-all-tasks/use-find-all-tasks.js';
import type { Task } from '#src/tasks/types/task.type.js';

vi.mock('#src/tasks/api/tasks.api.js', () => ({
  tasksApi: { findAll: vi.fn(), findByUuid: vi.fn() },
}));

describe('useFindAllTasks', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.findAll).mockReset();
    vi.mocked(tasksApi.findByUuid).mockReset();
  });

  it('discards a previous filter response even if fetch ignores cancellation', async () => {
    const oldRead = Promise.withResolvers<Task[]>();
    const currentRead = Promise.withResolvers<Task[]>();
    vi.mocked(tasksApi.findAll)
      .mockReturnValueOnce(oldRead.promise)
      .mockReturnValueOnce(currentRead.promise);
    const expired = vi.fn();
    const { result, rerender } = renderHook(
      ({ search }) => useFindAllTasks({ search }, 0, expired),
      { initialProps: { search: 'old' } },
    );
    const firstSignal = vi.mocked(tasksApi.findAll).mock.calls[0]?.[1];

    rerender({ search: 'current' });
    await act(async () => {
      currentRead.resolve([]);
      await currentRead.promise;
    });
    await act(async () => {
      oldRead.reject(new HttpError(401, ['expired']));
      await oldRead.promise.catch(() => undefined);
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(result.current).toEqual({ status: 'ready', data: [] });
    expect(expired).not.toHaveBeenCalled();
  });

  it('keeps read failures distinct from an empty list', async () => {
    vi.mocked(tasksApi.findAll).mockRejectedValue(
      new HttpError(503, ['Servidor temporalmente no disponible']),
    );
    const expired = vi.fn();
    const { result } = renderHook(() => useFindAllTasks({}, 0, expired));

    await waitFor(() =>
      expect(result.current).toEqual({
        status: 'error',
        message: 'Servidor temporalmente no disponible',
        code: 503,
      }),
    );
    expect(expired).not.toHaveBeenCalled();
  });
});
