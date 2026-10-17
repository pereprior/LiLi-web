import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '#src/shared/errors/http.error.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import { useFindTaskContext } from '#src/tasks/hooks/find-task-context/use-find-task-context.js';
import type { Task } from '#src/tasks/types/task.type.js';

vi.mock('#src/tasks/api/tasks.api.js', () => ({
  tasksApi: { findAll: vi.fn(), findByUuid: vi.fn() },
}));

describe('useFindTaskContext', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.findAll).mockReset();
    vi.mocked(tasksApi.findByUuid).mockReset();
  });

  it('invalidates session for a later family401 after the detail has already failed', async () => {
    const family = Promise.withResolvers<Task[]>();
    vi.mocked(tasksApi.findByUuid).mockRejectedValue(
      new HttpError(503, ['No disponible']),
    );
    vi.mocked(tasksApi.findAll).mockReturnValue(family.promise);
    const expired = vi.fn();
    const { result } = renderHook(() =>
      useFindTaskContext('task-uuid', 0, expired),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));

    await act(async () => {
      family.reject(new HttpError(401, ['expired']));
      await family.promise.catch(() => undefined);
    });

    expect(expired).toHaveBeenCalledOnce();
    expect(tasksApi.findByUuid).toHaveBeenCalledWith(
      'task-uuid',
      expect.any(AbortSignal),
    );
    expect(tasksApi.findAll).toHaveBeenCalledWith({}, expect.any(AbortSignal));
  });
});
