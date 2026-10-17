import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '#src/shared/errors/http.error.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import { TaskPriority } from '#src/tasks/types/enum/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';

describe('tasksApi', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('list queries', () => {
    it('requests the unfiltered list without empty query parameters', async () => {
      fetchMock.mockResolvedValue(Response.json([]));

      await expect(
        tasksApi.findAll({ search: '  ', status: [], dateFrom: '' }),
      ).resolves.toEqual([]);

      expect(fetchMock).toHaveBeenCalledWith('/tasks', expect.any(Object));
    });

    it('repeats selected statuses and preserves literal search characters', async () => {
      fetchMock.mockResolvedValue(Response.json([]));

      await tasksApi.findAll({
        status: [TaskStatus.PENDING, TaskStatus.BLOCKED],
        search: '  café %_\\  ',
        dateField: 'end',
        dateFrom: '2026-10-12',
        dateTo: '2026-10-18',
        sortBy: 'priority',
        sortDirection: 'desc',
      });

      const path = fetchMock.mock.calls[0]?.[0];
      if (typeof path !== 'string') throw new Error('Expected a relative URL.');
      const url = new URL(path, 'http://localhost:5173');
      expect(url.pathname).toBe('/tasks');
      expect([...url.searchParams.entries()]).toEqual([
        ['search', 'café %_\\'],
        ['sortBy', 'priority'],
        ['sortDirection', 'desc'],
        ['status', 'PENDING'],
        ['status', 'BLOCKED'],
        ['dateField', 'end'],
        ['dateFrom', '2026-10-12'],
        ['dateTo', '2026-10-18'],
      ]);
    });

    it('removes incompatible status and date filters from a quick view', async () => {
      fetchMock.mockResolvedValue(Response.json([]));

      await tasksApi.findAll({
        view: 'upcoming',
        status: [TaskStatus.COMPLETED],
        dateField: 'end',
        dateFrom: '2026-10-12',
        dateTo: '2026-10-18',
        search: 'comida',
        sortBy: 'start',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/tasks?search=comida&sortBy=start&view=upcoming',
        expect.any(Object),
      );
    });

    it('passes the read cancellation signal to fetch', async () => {
      const controller = new AbortController();
      fetchMock.mockResolvedValue(Response.json([]));

      await tasksApi.findAll({}, controller.signal);

      expect(fetchMock).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({
          signal: controller.signal,
          cache: 'no-store',
        }),
      );
    });
  });

  describe('response contracts', () => {
    it('preserves missing time and explicit midnight in the task response', async () => {
      const task: Task = {
        uuid: '91879373-16a2-47ea-9baa-40e15fef2ad1',
        userUuid: 'aefaa1c3-9683-48f8-8c20-480430ec22a5',
        parentUuid: null,
        name: 'Comprar comida',
        description: '',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        start: { date: '2026-10-15', time: null },
        end: { date: '2026-10-16', time: '00:00' },
        reminder: null,
      };
      fetchMock.mockResolvedValue(Response.json(task));

      await expect(tasksApi.findByUuid(task.uuid)).resolves.toEqual(task);
    });

    it.each([
      null,
      { action: 'task.find', result: [] },
      [{ name: 'Missing required public properties' }],
      [
        {
          uuid: 'task',
          userUuid: 'user',
          parentUuid: null,
          name: 'Unknown status',
          description: null,
          priority: 'MEDIUM',
          status: 'UNKNOWN',
          start: null,
          end: null,
          reminder: null,
        },
      ],
    ])('rejects an unexpected list shape %j', async (body) => {
      fetchMock.mockResolvedValue(Response.json(body));

      await expect(tasksApi.findAll()).rejects.toEqual(
        new HttpError(200, [
          'La respuesta del servidor no tiene el formato esperado.',
        ]),
      );
    });
  });

  describe('writes', () => {
    it('creates from allowed fields and excludes server-owned task properties', async () => {
      const task: Task = {
        uuid: '91879373-16a2-47ea-9baa-40e15fef2ad1',
        userUuid: 'aefaa1c3-9683-48f8-8c20-480430ec22a5',
        parentUuid: null,
        name: 'Comida',
        description: null,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        start: null,
        end: null,
        reminder: null,
      };
      fetchMock.mockResolvedValue(Response.json(task, { status: 201 }));

      await tasksApi.create({
        ...task,
        start: '2026-10-15',
        end: null,
        reminder: null,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Comida',
            priority: TaskPriority.MEDIUM,
            description: null,
            parentUuid: null,
            start: '2026-10-15',
            end: null,
            reminder: null,
          }),
        }),
      );
    });

    it('sends a partial patch with explicit null and no omitted fields', async () => {
      fetchMock.mockResolvedValue(
        Response.json({
          uuid: 'task',
          userUuid: 'user',
          parentUuid: null,
          name: 'Comida',
          description: null,
          status: TaskStatus.PENDING,
          priority: TaskPriority.LOW,
          start: null,
          end: null,
          reminder: null,
        }),
      );

      await tasksApi.updateDetails('task', {
        priority: TaskPriority.LOW,
        reminder: null,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/tasks/task',
        expect.objectContaining({
          method: 'PATCH',
          body: '{"priority":"LOW","reminder":null}',
        }),
      );
    });

    it('uses the dedicated status route and sends only the target status', async () => {
      fetchMock.mockResolvedValue(
        Response.json({
          uuid: 'task',
          userUuid: 'user',
          parentUuid: null,
          name: 'Comida',
          description: null,
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          start: null,
          end: null,
          reminder: null,
        }),
      );

      await tasksApi.updateStatus('task', TaskStatus.IN_PROGRESS);

      expect(fetchMock).toHaveBeenCalledWith(
        '/tasks/task/status',
        expect.objectContaining({
          method: 'PATCH',
          body: '{"status":"IN_PROGRESS"}',
        }),
      );
    });

    it('confirms deletion only after the success response', async () => {
      fetchMock.mockResolvedValue(Response.json({ success: true }));

      await expect(tasksApi.delete('task')).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenCalledWith(
        '/tasks/task',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('rejects an unsuccessful deletion response', async () => {
      fetchMock.mockResolvedValue(Response.json({ success: false }));

      await expect(tasksApi.delete('task')).rejects.toEqual(
        new HttpError(200, [
          'La respuesta del servidor no tiene el formato esperado.',
        ]),
      );
    });
  });
});
