import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TaskDetail } from '#src/tasks/components/detail/task-detail.js';
import type { Task } from '#src/tasks/types/task.types.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

describe('TaskDetail', () => {
  it('explains missing start and offers editing before scheduling', () => {
    const onEdit = vi.fn();
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar comida',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    render(
      <TaskDetail
        task={task}
        family={[]}
        email="family@example.com"
        busy={false}
        onSelect={vi.fn()}
        onEdit={onEdit}
        onCreateSubtask={vi.fn()}
        onChangeStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'Programada' })).toBeDisabled();
    expect(
      screen.getByText(
        'Para programar la tarea, añade primero una fecha de inicio.',
      ),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Añadir inicio para programar' }),
    );

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('requests a manual allowed status change through its callback', () => {
    const onChangeStatus = vi.fn();
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar comida',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    render(
      <TaskDetail
        task={task}
        family={[]}
        email="family@example.com"
        busy={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onCreateSubtask={vi.fn()}
        onChangeStatus={onChangeStatus}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Estado' }), {
      target: { value: TaskStatus.IN_PROGRESS },
    });

    expect(onChangeStatus).toHaveBeenCalledExactlyOnceWith(
      TaskStatus.IN_PROGRESS,
    );
  });

  it('shows terminal tasks as read-only while retaining deletion', () => {
    const onDelete = vi.fn();
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar comida',
      description: null,
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    render(
      <TaskDetail
        task={task}
        family={[]}
        email="family@example.com"
        busy={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onCreateSubtask={vi.fn()}
        onChangeStatus={vi.fn()}
        onDelete={onDelete}
      />,
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Editar tarea' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Añadir subtarea' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar tarea' }));

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('includes terminal subtasks in the family and allows opening them', () => {
    const onSelect = vi.fn();
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comprar comida',
      description: null,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    const child: Task = {
      ...task,
      uuid: 'child',
      parentUuid: task.uuid,
      name: 'Revisar despensa',
      status: TaskStatus.COMPLETED,
    };
    render(
      <TaskDetail
        task={task}
        family={[child]}
        email="family@example.com"
        busy={false}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onCreateSubtask={vi.fn()}
        onChangeStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Revisar despensa Completada · Prioridad media',
      }),
    );

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('child');
    expect(screen.getByRole('option', { name: 'Cancelada' })).toBeDisabled();
  });

  it('offers a backlink to a subtask principal without nested-subtask creation', () => {
    const onSelect = vi.fn();
    const parent: Task = {
      uuid: 'parent',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comida',
      description: null,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    const task: Task = {
      ...parent,
      uuid: 'child',
      parentUuid: parent.uuid,
      name: 'Despensa',
    };
    render(
      <TaskDetail
        task={task}
        family={[parent]}
        email="family@example.com"
        busy={false}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onCreateSubtask={vi.fn()}
        onChangeStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver principal: Comida' }),
    );

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('parent');
    expect(
      screen.queryByRole('button', { name: 'Añadir subtarea' }),
    ).not.toBeInTheDocument();
  });

  it('explains the default reminder time without confirming email delivery', () => {
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comida',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: { date: '2026-10-15', time: null },
    };
    render(
      <TaskDetail
        task={task}
        family={[]}
        email="family@example.com"
        busy={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onCreateSubtask={vi.fn()}
        onChangeStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Recordatorio guardado para family@example.com. Sin hora, se programa a las 06:00 de Madrid. La fecha guardada no confirma el envío ni la recepción del correo.',
    );
  });

  it('disables mutations and navigation while a write is in progress', () => {
    const task: Task = {
      uuid: 'task',
      userUuid: 'user',
      parentUuid: null,
      name: 'Comida',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };
    render(
      <TaskDetail
        task={task}
        family={[]}
        email="family@example.com"
        busy={true}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onCreateSubtask={vi.fn()}
        onChangeStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Estado' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Editar tarea' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Añadir subtarea' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Eliminar tarea' }),
    ).toBeDisabled();
  });
});
