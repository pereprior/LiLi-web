import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '#src/shared/errors/http.error.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import { TasksPage } from '#src/tasks/components/page/tasks-page.js';
import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';

vi.mock('#src/tasks/api/tasks.api.js', () => ({
  tasksApi: { findByUuid: vi.fn(), findAll: vi.fn(), updateDetails: vi.fn() },
}));

describe('task editor conflict recovery', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.findByUuid).mockReset();
    vi.mocked(tasksApi.findAll).mockReset();
    vi.mocked(tasksApi.updateDetails).mockReset();
  });

  it.each([TaskStatus.COMPLETED, TaskStatus.CANCELLED])(
    'preserves the draft and blocks saving when a conflict reload returns %s',
    async (status) => {
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
      const refreshed = Promise.withResolvers<Task>();
      vi.mocked(tasksApi.findAll).mockResolvedValue([task]);
      vi.mocked(tasksApi.findByUuid)
        .mockResolvedValueOnce(task)
        .mockReturnValueOnce(refreshed.promise);
      vi.mocked(tasksApi.updateDetails).mockRejectedValue(
        new HttpError(409, []),
      );
      render(
        <MemoryRouter initialEntries={['/?task=task']}>
          <TasksPage email="family@example.com" onUnauthorized={vi.fn()} />
        </MemoryRouter>,
      );
      fireEvent.click(
        await screen.findByRole(
          'button',
          { name: 'Editar tarea' },
          { timeout: 5000 },
        ),
      );
      fireEvent.change(screen.getByRole('textbox', { name: /^Nombre/u }), {
        target: { value: 'Mi borrador' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

      await waitFor(() => expect(tasksApi.findByUuid).toHaveBeenCalledTimes(2));
      expect(
        screen.getByRole('button', { name: 'Guardar cambios' }),
      ).toBeDisabled();
      await act(() => {
        refreshed.resolve({ ...task, status });
        return refreshed.promise;
      });

      expect(screen.getByRole('textbox', { name: /^Nombre/u })).toHaveValue(
        'Mi borrador',
      );
      expect(screen.getByRole('textbox', { name: /^Nombre/u })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Guardar cambios' }),
      ).toBeDisabled();
      expect(tasksApi.updateDetails).toHaveBeenCalledOnce();
    },
    15_000,
  );

  it('blocks saving an unavailable task and allows retrying the read without losing the draft', async () => {
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
    vi.mocked(tasksApi.findAll).mockResolvedValue([task]);
    vi.mocked(tasksApi.findByUuid)
      .mockResolvedValueOnce(task)
      .mockRejectedValueOnce(new HttpError(404, []))
      .mockResolvedValueOnce(task);
    vi.mocked(tasksApi.updateDetails).mockRejectedValue(new HttpError(404, []));
    render(
      <MemoryRouter initialEntries={['/?task=task']}>
        <TasksPage email="family@example.com" onUnauthorized={vi.fn()} />
      </MemoryRouter>,
    );
    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: 'Editar tarea' },
        { timeout: 5000 },
      ),
    );
    fireEvent.change(screen.getByRole('textbox', { name: /^Nombre/u }), {
      target: { value: 'Mi borrador' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const retry = await screen.findByRole(
      'button',
      { name: 'Reintentar' },
      { timeout: 5000 },
    );
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    ).toBeDisabled();
    expect(
      within(screen.getByRole('dialog', { name: 'Editar tarea' })).getByText(
        'La tarea ya no está disponible. Vuelve a la lista o recarga.',
      ),
    ).toBeVisible();
    fireEvent.click(retry);
    await waitFor(() => expect(tasksApi.findByUuid).toHaveBeenCalledTimes(3));

    expect(screen.getByRole('textbox', { name: /^Nombre/u })).toHaveValue(
      'Mi borrador',
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Guardar cambios' }),
      ).toBeEnabled(),
    );
    expect(tasksApi.updateDetails).toHaveBeenCalledOnce();
  }, 15_000);
});
