import { describe, expect, it } from 'vitest';

import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';
import {
  getStatusChangeReason,
  isTerminalStatus,
} from '#src/tasks/utils/task-state-rules.utils.js';

describe('task status restrictions', () => {
  it.each(Object.values(TaskStatus))(
    'identifies terminal status %s',
    (status) => {
      expect(isTerminalStatus(status)).toBe(
        status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED,
      );
    },
  );

  it('requires a start before scheduling', () => {
    const task: Task = {
      uuid: 'principal',
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

    expect(getStatusChangeReason(task, TaskStatus.SCHEDULED, [])).toBe(
      'Para programar la tarea, añade primero una fecha de inicio.',
    );
  });

  it.each([
    [TaskStatus.PENDING, [TaskStatus.PENDING]],
    [TaskStatus.SCHEDULED, [TaskStatus.PENDING, TaskStatus.SCHEDULED]],
    [TaskStatus.IN_PROGRESS, Object.values(TaskStatus)],
    [TaskStatus.PAUSED, Object.values(TaskStatus)],
    [TaskStatus.BLOCKED, Object.values(TaskStatus)],
    [TaskStatus.COMPLETED, [TaskStatus.COMPLETED, TaskStatus.CANCELLED]],
    [TaskStatus.CANCELLED, [TaskStatus.CANCELLED]],
  ])(
    'respects the subtask matrix for principal %s',
    (parentStatus, allowed) => {
      const parent: Task = {
        uuid: 'principal',
        userUuid: 'user',
        parentUuid: null,
        name: 'Comida',
        description: null,
        status: parentStatus,
        priority: TaskPriority.MEDIUM,
        start: { date: '2026-10-15', time: null },
        end: null,
        reminder: null,
      };
      const subtask: Task = {
        ...parent,
        uuid: 'subtask',
        parentUuid: parent.uuid,
        status: TaskStatus.PENDING,
      };

      const destinations = Object.values(TaskStatus).filter(
        (target) => getStatusChangeReason(subtask, target, [parent]) === null,
      );

      expect(destinations).toEqual(
        [...new Set([TaskStatus.PENDING, ...allowed])].sort(
          (left, right) =>
            Object.values(TaskStatus).indexOf(left) -
            Object.values(TaskStatus).indexOf(right),
        ),
      );
    },
  );

  it('blocks status changes when the principal context is missing', () => {
    const task: Task = {
      uuid: 'subtask',
      userUuid: 'user',
      parentUuid: 'principal',
      name: 'Comida',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      start: null,
      end: null,
      reminder: null,
    };

    expect(getStatusChangeReason(task, TaskStatus.IN_PROGRESS, [])).toBe(
      'No se ha podido cargar la principal. Recarga antes de cambiar el estado.',
    );
  });

  it('requires every visible subtask to finish before completing its principal', () => {
    const task: Task = {
      uuid: 'principal',
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
    const child: Task = {
      ...task,
      uuid: 'child',
      parentUuid: task.uuid,
      status: TaskStatus.PENDING,
    };

    expect(getStatusChangeReason(task, TaskStatus.COMPLETED, [child])).toBe(
      'Para completar la tarea, completa o cancela todas sus subtareas.',
    );
  });

  it('allows completion when every visible child is completed or cancelled', () => {
    const task: Task = {
      uuid: 'principal',
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
    const completed: Task = {
      ...task,
      uuid: 'completed',
      parentUuid: task.uuid,
      status: TaskStatus.COMPLETED,
    };
    const cancelled: Task = {
      ...task,
      uuid: 'cancelled',
      parentUuid: task.uuid,
      status: TaskStatus.CANCELLED,
    };

    expect(
      getStatusChangeReason(task, TaskStatus.COMPLETED, [completed, cancelled]),
    ).toBeNull();
  });

  it('blocks cancellation when a completed child would be affected', () => {
    const task: Task = {
      uuid: 'principal',
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
    const child: Task = {
      ...task,
      uuid: 'child',
      parentUuid: task.uuid,
      status: TaskStatus.COMPLETED,
    };

    expect(getStatusChangeReason(task, TaskStatus.CANCELLED, [child])).toBe(
      'No se puede cancelar una tarea que tiene subtareas completadas.',
    );
  });

  it('allows cancelling a principal with active or cancelled children', () => {
    const task: Task = {
      uuid: 'principal',
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
    const child: Task = {
      ...task,
      uuid: 'child',
      parentUuid: task.uuid,
      status: TaskStatus.PENDING,
    };

    expect(
      getStatusChangeReason(task, TaskStatus.CANCELLED, [child]),
    ).toBeNull();
  });

  it.each([TaskStatus.PENDING, TaskStatus.SCHEDULED])(
    'blocks principal %s when children are further advanced',
    (target) => {
      const task: Task = {
        uuid: 'principal',
        userUuid: 'user',
        parentUuid: null,
        name: 'Comida',
        description: null,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        start: { date: '2026-10-15', time: null },
        end: null,
        reminder: null,
      };
      const child: Task = {
        ...task,
        uuid: 'child',
        parentUuid: task.uuid,
        status: TaskStatus.BLOCKED,
      };

      expect(getStatusChangeReason(task, target, [child])).not.toBeNull();
    },
  );

  it.each([TaskStatus.COMPLETED, TaskStatus.CANCELLED])(
    'blocks reopening a terminal task in %s',
    (status) => {
      const task: Task = {
        uuid: 'principal',
        userUuid: 'user',
        parentUuid: null,
        name: 'Comida',
        description: null,
        status,
        priority: TaskPriority.MEDIUM,
        start: null,
        end: null,
        reminder: null,
      };

      expect(getStatusChangeReason(task, TaskStatus.PENDING, [])).toBe(
        'Las tareas completadas y canceladas son de solo lectura.',
      );
    },
  );
});
