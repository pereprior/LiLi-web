import { describe, expect, it } from 'vitest';

import { createTaskDraft } from '#src/tasks/mappers/task-form.mapper.js';
import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';
import { validateTaskDraft } from '#src/tasks/validators/task-form.validator.js';

describe('task form validator', () => {
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

  it('rejects clearing the start of a scheduled task', () => {
    const draft = {
      ...createTaskDraft(original),
      start: { date: '', time: '' },
    };

    expect(validateTaskDraft(draft, original)).toEqual({
      start: 'Una tarea programada necesita un día de inicio.',
    });
  });

  it('validates an edited end against the existing start', () => {
    const draft = {
      ...createTaskDraft(original),
      end: { date: '2026-10-14', time: '' },
    };

    expect(validateTaskDraft(draft, original)).toEqual({
      end: 'El fin no puede ser anterior al inicio.',
    });
  });
  describe('validation', () => {
    it('rejects a name containing only whitespace', () => {
      const draft = { ...createTaskDraft(), name: ' \t ' };

      expect(validateTaskDraft(draft)).toEqual({
        name: 'Escribe un nombre para la tarea.',
      });
    });

    it.each([
      '2026-02-29',
      '2100-02-29',
      '2026-04-31',
      '2026-13-01',
      '2026-01-00',
    ])('rejects invalid calendar day %s', (date) => {
      const draft = {
        ...createTaskDraft(),
        name: 'Comprar',
        reminder: { date, time: '' },
      };

      expect(validateTaskDraft(draft)).toEqual({
        reminder: 'Indica una fecha válida.',
      });
    });

    it('accepts a leap day and an independent reminder with no start or end', () => {
      const draft = {
        ...createTaskDraft(),
        name: 'Comprar',
        reminder: { date: '2024-02-29', time: '' },
      };

      expect(validateTaskDraft(draft)).toEqual({});
    });

    it.each(['24:00', '09:60', '9:30', '09:30:00'])(
      'rejects invalid minute-format time %s',
      (time) => {
        const draft = {
          ...createTaskDraft(),
          name: 'Comprar',
          start: { date: '2026-10-15', time },
        };

        expect(validateTaskDraft(draft)).toEqual({
          start: 'Indica una hora válida con horas y minutos.',
        });
      },
    );

    it('requires a day when a time is present', () => {
      const draft = {
        ...createTaskDraft(),
        name: 'Comprar',
        start: { date: '', time: '09:30' },
      };

      expect(validateTaskDraft(draft)).toEqual({
        start: 'Indica un día antes de añadir la hora.',
      });
    });

    it('rejects inverted explicit hours on the same day', () => {
      const draft = {
        ...createTaskDraft(),
        name: 'Comprar',
        start: { date: '2026-10-15', time: '10:00' },
        end: { date: '2026-10-15', time: '09:00' },
      };

      expect(validateTaskDraft(draft)).toEqual({
        end: 'El fin no puede ser anterior al inicio.',
      });
    });

    it.each([
      { startTime: '', endTime: '00:00' },
      { startTime: '23:00', endTime: '' },
      { startTime: '00:00', endTime: '00:00' },
    ])(
      'accepts same-day interval $startTime to $endTime',
      ({ startTime, endTime }) => {
        const draft = {
          ...createTaskDraft(),
          name: 'Comprar',
          start: { date: '2026-10-15', time: startTime },
          end: { date: '2026-10-15', time: endTime },
        };

        expect(validateTaskDraft(draft)).toEqual({});
      },
    );
  });
});
