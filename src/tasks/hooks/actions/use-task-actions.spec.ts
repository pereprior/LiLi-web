import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '#src/shared/http/http-client.js';
import { i18n } from '#src/shared/i18n/i18n.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import { useTaskActions } from '#src/tasks/hooks/actions/use-task-actions.js';
import type { Task } from '#src/tasks/types/task.types.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

vi.mock('#src/tasks/api/tasks.api.js', () => ({
  tasksApi: {
    create: vi.fn(),
    update: vi.fn(),
    list: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('task actions', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.create).mockReset();
    vi.mocked(tasksApi.update).mockReset();
    vi.mocked(tasksApi.list).mockReset();
    vi.mocked(tasksApi.remove).mockReset();
    vi.mocked(tasksApi.updateStatus).mockReset();
  });

  it('confirms a creation independently from the subsequent list reload', async () => {
    const saved: Task = {
      uuid: 'saved',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar pan',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: { date: '2026-10-15', time: null },
    };
    vi.mocked(tasksApi.create).mockResolvedValue(saved);
    const selectTask = vi.fn();
    const refresh = vi.fn();
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: true,
        selectTask,
        refresh,
        onUnauthorized: vi.fn(),
      }),
    );
    act(() => result.current.openEditor({ kind: 'create' }));

    await act(() =>
      result.current.save({ name: 'Comprar pan', reminder: '2026-10-15' }),
    );

    expect(result.current.editor).toBeNull();
    expect(result.current.notice).toContain(
      'Tarea creada. Recordatorio guardado.',
    );
    expect(result.current.notice).toContain('La consulta actual puede excluir');
    expect(selectTask).toHaveBeenCalledWith('saved');
    expect(refresh).toHaveBeenCalledOnce();
    expect(tasksApi.create).toHaveBeenCalledOnce();
  });

  it('blocks another creation until the user has checked the full list', async () => {
    vi.mocked(tasksApi.create).mockRejectedValue(
      new HttpError(0, ['Network failed']),
    );
    vi.mocked(tasksApi.list).mockResolvedValue([]);
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask: vi.fn(),
        refresh: vi.fn(),
        onUnauthorized: vi.fn(),
      }),
    );
    act(() => result.current.openEditor({ kind: 'create' }));
    await act(() => result.current.save({ name: 'Comprar pan' }));

    await act(() => result.current.save({ name: 'Comprar pan' }));
    expect(tasksApi.create).toHaveBeenCalledOnce();
    expect(result.current.editor).toEqual({ kind: 'create' });
    expect(result.current.uncertainCreation).toEqual({
      tasks: null,
      checking: false,
    });

    await act(() => result.current.reviewCreation());
    expect(tasksApi.list).toHaveBeenCalledWith();
    expect(result.current.uncertainCreation).toEqual({
      tasks: [],
      checking: false,
    });
    await act(() => result.current.save({ name: 'Comprar pan' }));
    expect(tasksApi.create).toHaveBeenCalledTimes(2);
  });

  it('translates a creation notice without repeating the mutation', async () => {
    vi.mocked(tasksApi.create).mockResolvedValue({
      uuid: 'saved',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar pan',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    });
    const refresh = vi.fn();
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask: vi.fn(),
        refresh,
        onUnauthorized: vi.fn(),
      }),
    );
    act(() => result.current.openEditor({ kind: 'create' }));
    await act(() => result.current.save({ name: 'Comprar pan' }));
    expect(result.current.notice).toBe('Tarea creada.');

    await act(() => i18n.changeLanguage('en'));

    expect(result.current.notice).toBe('Task created.');
    expect(tasksApi.create).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('translates uncertain creation without releasing the retry safeguard', async () => {
    vi.mocked(tasksApi.create).mockRejectedValue(
      new TypeError('Failed to fetch'),
    );
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask: vi.fn(),
        refresh: vi.fn(),
        onUnauthorized: vi.fn(),
      }),
    );
    act(() => result.current.openEditor({ kind: 'create' }));
    await act(() => result.current.save({ name: 'Comprar pan' }));

    await act(() => i18n.changeLanguage('en'));
    await act(() => result.current.save({ name: 'Comprar pan' }));

    expect(result.current.mutationError).toBe(
      'No confirmation was received. The task may have been created. Check the list before trying again.',
    );
    expect(result.current.uncertainCreation).toEqual({
      tasks: null,
      checking: false,
    });
    expect(tasksApi.create).toHaveBeenCalledOnce();
  });

  it('retains the editing session and refreshes context after409', async () => {
    const task: Task = {
      uuid: 'saved',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar pan',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    vi.mocked(tasksApi.update).mockRejectedValue(
      new HttpError(409, ['La tarea ha cambiado']),
    );
    const refresh = vi.fn();
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask: vi.fn(),
        refresh,
        onUnauthorized: vi.fn(),
      }),
    );
    act(() => result.current.openEditor({ kind: 'edit', task }));

    await act(() => result.current.save({ description: 'Mi borrador' }));

    expect(result.current.editor).toEqual({ kind: 'edit', task });
    expect(result.current.mutationError).toContain(
      'revisa la tarea y sus subtareas',
    );
    expect(result.current.mutationError).toContain('La tarea ha cambiado');
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('does not select or refresh private data after the page has unmounted', async () => {
    const write = Promise.withResolvers<Task>();
    vi.mocked(tasksApi.create).mockReturnValue(write.promise);
    const selectTask = vi.fn();
    const refresh = vi.fn();
    const { result, unmount } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask,
        refresh,
        onUnauthorized: vi.fn(),
      }),
    );
    act(() => result.current.openEditor({ kind: 'create' }));
    let save: Promise<void>;
    act(() => {
      save = result.current.save({ name: 'Comprar pan' });
    });
    unmount();

    write.resolve({
      uuid: 'saved',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar pan',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    });
    await save!;

    expect(selectTask).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('waits for confirmation before deleting a task', async () => {
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar pan',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    vi.mocked(tasksApi.remove).mockResolvedValue(undefined);
    const selectTask = vi.fn();
    const refresh = vi.fn();
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask,
        refresh,
        onUnauthorized: vi.fn(),
      }),
    );

    act(() => result.current.requestDelete(task));

    expect(result.current.confirmation).toEqual({ kind: 'delete', task });
    expect(tasksApi.remove).not.toHaveBeenCalled();

    await act(() => result.current.confirmAction());

    expect(tasksApi.remove).toHaveBeenCalledWith('task');
    expect(result.current.confirmation).toBeNull();
    expect(selectTask).toHaveBeenCalledWith(null);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('can dismiss a principal cancellation without writing to the API', () => {
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Preparar viaje',
      description: null,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    const { result } = renderHook(() =>
      useTaskActions({
        filtered: false,
        selectTask: vi.fn(),
        refresh: vi.fn(),
        onUnauthorized: vi.fn(),
      }),
    );

    act(() => result.current.requestStatusChange(task, TaskStatus.CANCELLED));
    expect(result.current.confirmation).toEqual({ kind: 'cancel', task });
    expect(tasksApi.updateStatus).not.toHaveBeenCalled();

    act(() => result.current.closeConfirmation());

    expect(result.current.confirmation).toBeNull();
    expect(tasksApi.updateStatus).not.toHaveBeenCalled();
  });
});
