import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '#src/shared/i18n/i18n.js';
import { TaskForm } from '#src/tasks/components/form/task-form.js';
import type { Task } from '#src/tasks/types/task.types.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

afterEach(cleanup);

describe('TaskForm', () => {
  it('submits a minimal creation without exposing backend-owned fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /^Nombre/u }), {
      target: { value: '  Comprar comida  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Comprar comida',
        priority: TaskPriority.MEDIUM,
      }),
    );
  });

  it('prevents invalid submission and associates the name error with its field', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));

    expect(onSubmit).not.toHaveBeenCalled();
    const name = screen.getByRole('textbox', { name: /^Nombre/u });
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(
      document.getElementById(name.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('Escribe un nombre para la tarea.');
  });

  it('keeps the day when clearing its explicit time', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /^Nombre/u }), {
      target: { value: 'Comprar' },
    });
    fireEvent.change(screen.getByLabelText('Día de recordatorio'), {
      target: { value: '2026-10-15' },
    });
    fireEvent.change(screen.getByLabelText('Hora de recordatorio'), {
      target: { value: '00:00' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Quitar hora de recordatorio' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Comprar',
        priority: TaskPriority.MEDIUM,
        reminder: '2026-10-15',
      }),
    );
  });

  it('translates validation while keeping the entered draft', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Descripción' }), {
      target: { value: 'My family plan' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));
    expect(screen.getByText('Escribe un nombre para la tarea.')).toBeVisible();

    await act(() => i18n.changeLanguage('en'));

    expect(screen.getByText('Enter a task name.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      'My family plan',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('preserves a draft and its PATCH baseline when a refreshed task arrives', async () => {
    const task: Task = {
      uuid: 'task-uuid',
      userUuid: 'user-uuid',
      parentUuid: null,
      name: 'Comprar',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <TaskForm
        task={task}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /^Nombre/u }), {
      target: { value: 'Mi borrador' },
    });
    rerender(
      <TaskForm
        task={{ ...task, priority: TaskPriority.HIGH }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error="Conflicto; revisa los cambios."
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      screen.getByRole<HTMLInputElement>('textbox', { name: /^Nombre/u }).value,
    ).toBe('Mi borrador');
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Mi borrador' }),
    );
  });

  it('uses null when removing an existing description', async () => {
    const task: Task = {
      uuid: 'task-uuid',
      userUuid: 'user-uuid',
      parentUuid: null,
      name: 'Comprar',
      description: 'Para la semana',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskForm
        task={task}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Quitar descripción' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ description: null }),
    );
  });

  it('preserves entered values when submission rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Disconnected'));
    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /^Nombre/u }), {
      target: { value: 'Mi borrador' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));

    await screen.findByText('No se pudo guardar la tarea. Inténtalo de nuevo.');
    expect(
      screen.getByRole<HTMLInputElement>('textbox', { name: /^Nombre/u }).value,
    ).toBe('Mi borrador');
  });

  it('disables saving an unchanged edit', () => {
    const task: Task = {
      uuid: 'task-uuid',
      userUuid: 'user-uuid',
      parentUuid: null,
      name: 'Comprar',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    render(
      <TaskForm
        task={task}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Guardar cambios',
      }).disabled,
    ).toBe(true);
  });

  it('locks inputs and submission while a save is in progress', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByRole<HTMLInputElement>('textbox', { name: /^Nombre/u })
        .disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Cancelar' })
        .disabled,
    ).toBe(true);
    expect(
      screen
        .getByRole('form', { name: 'Crear tarea' })
        .getAttribute('aria-busy'),
    ).toBe('true');
  });

  it('disables editing and saving a terminal task', () => {
    const task: Task = {
      uuid: 'task-uuid',
      userUuid: 'user-uuid',
      parentUuid: null,
      name: 'Comprar',
      description: null,
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: { date: '2026-10-15', time: null },
    };
    render(
      <TaskForm
        task={task}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitting={false}
        error={null}
      />,
    );

    expect(
      screen.getByRole<HTMLInputElement>('textbox', { name: /^Nombre/u })
        .disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Guardar cambios',
      }).disabled,
    ).toBe(true);
    expect(screen.getByText(/no representan avisos activos/u)).toBeDefined();
  });
});
