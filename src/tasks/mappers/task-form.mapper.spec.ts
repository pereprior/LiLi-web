import { describe, expect, it } from 'vitest';

import {
  buildCreateTaskInput,
  buildUpdateTaskDetailsInput,
  createTaskDraft,
} from '#src/tasks/mappers/task-form.mapper.js';
import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';

describe('task form mapper', () => {
  describe('creation', () => {
    it('creates a minimal task with trimmed name and default medium priority', () => {
      const draft = { ...createTaskDraft(), name: '  Comprar comida  ' };

      expect(buildCreateTaskInput(draft)).toEqual({
        name: 'Comprar comida',
        priority: TaskPriority.MEDIUM,
      });
    });

    it('serializes local days and explicit midnight without timezone conversion', () => {
      const draft = {
        ...createTaskDraft(),
        name: 'Comprar comida',
        start: { date: '2026-10-15', time: '' },
        end: { date: '2026-10-16', time: '00:00' },
        reminder: { date: '2026-10-14', time: '09:30' },
      };

      expect(buildCreateTaskInput(draft, 'parent-uuid')).toEqual({
        name: 'Comprar comida',
        priority: TaskPriority.MEDIUM,
        parentUuid: 'parent-uuid',
        start: '2026-10-15',
        end: '2026-10-16T00:00',
        reminder: '2026-10-14T09:30',
      });
    });

    it('keeps an explicitly empty description', () => {
      const draft = { ...createTaskDraft(), name: 'Comprar', description: '' };

      expect(buildCreateTaskInput(draft)).toEqual({
        name: 'Comprar',
        description: '',
        priority: TaskPriority.MEDIUM,
      });
    });
  });

  describe('partial updates', () => {
    const original: Task = {
      uuid: 'task-uuid',
      userUuid: 'user-uuid',
      parentUuid: 'parent-uuid',
      name: 'Comprar comida',
      description: 'Para la semana',
      status: TaskStatus.SCHEDULED,
      priority: TaskPriority.HIGH,
      start: { date: '2026-10-15', time: null },
      end: { date: '2026-10-16', time: '00:00' },
      reminder: { date: '2026-10-14', time: null },
    };

    it('omits unchanged fields, including midnight and a reminder without time', () => {
      const draft = createTaskDraft(original);

      expect(buildUpdateTaskDetailsInput(draft, original)).toEqual({});
    });

    it('updates only priority and explicitly clears a reminder', () => {
      const draft = {
        ...createTaskDraft(original),
        priority: TaskPriority.LOW,
        reminder: { date: '', time: '' },
      };

      expect(buildUpdateTaskDetailsInput(draft, original)).toEqual({
        priority: TaskPriority.LOW,
        reminder: null,
      });
    });

    it.each([
      { description: null, expected: null },
      { description: '', expected: '' },
    ])(
      'distinguishes description $expected from an omitted field',
      ({ description, expected }) => {
        const draft = { ...createTaskDraft(original), description };

        expect(buildUpdateTaskDetailsInput(draft, original)).toEqual({
          description: expected,
        });
      },
    );

    it('clears an explicit time while preserving the day', () => {
      const draft = {
        ...createTaskDraft(original),
        end: { date: '2026-10-16', time: '' },
      };

      expect(buildUpdateTaskDetailsInput(draft, original)).toEqual({
        end: '2026-10-16',
      });
    });
  });
});
