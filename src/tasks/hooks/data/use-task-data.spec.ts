import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '#src/shared/http/http-client.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import {
  useTaskContext,
  useTaskList,
} from '#src/tasks/hooks/data/use-task-data.js';
import type { Task } from '#src/tasks/types/task.types.js';

vi.mock('#src/tasks/api/tasks.api.js', () => ({
  tasksApi: { list: vi.fn(), get: vi.fn() },
}));

describe('task reads', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.list).mockReset();
    vi.mocked(tasksApi.get).mockReset();
  });

  it('discards a previous filter response even if fetch ignores cancellation', async () => {
    const oldRead = Promise.withResolvers<Task[]>();
    const currentRead = Promise.withResolvers<Task[]>();
    vi.mocked(tasksApi.list)
      .mockReturnValueOnce(oldRead.promise)
      .mockReturnValueOnce(currentRead.promise);
    const expired = vi.fn();
    const { result, rerender } = renderHook(
      ({ search }) => useTaskList({ search }, 0, expired),
      { initialProps: { search: 'old' } },
    );
    const firstSignal = vi.mocked(tasksApi.list).mock.calls[0]?.[1];

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
    vi.mocked(tasksApi.list).mockRejectedValue(
      new HttpError(503, ['Servidor temporalmente no disponible']),
    );
    const expired = vi.fn();
    const { result } = renderHook(() => useTaskList({}, 0, expired));

    await waitFor(() =>
      expect(result.current).toEqual({
        status: 'error',
        message: 'Servidor temporalmente no disponible',
        code: 503,
      }),
    );
    expect(expired).not.toHaveBeenCalled();
  });

  it('invalidates session for a later family401 after the detail has already failed', async () => {
    const family = Promise.withResolvers<Task[]>();
    vi.mocked(tasksApi.get).mockRejectedValue(
      new HttpError(503, ['No disponible']),
    );
    vi.mocked(tasksApi.list).mockReturnValue(family.promise);
    const expired = vi.fn();
    const { result } = renderHook(() =>
      useTaskContext('task-uuid', 0, expired),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));

    await act(async () => {
      family.reject(new HttpError(401, ['expired']));
      await family.promise.catch(() => undefined);
    });

    expect(expired).toHaveBeenCalledOnce();
    expect(tasksApi.get).toHaveBeenCalledWith(
      'task-uuid',
      expect.any(AbortSignal),
    );
    expect(tasksApi.list).toHaveBeenCalledWith({}, expect.any(AbortSignal));
  });
});
