import { request } from '#src/shared/http/http-client.js';
import { buildTasksPath } from '#src/tasks/mappers/task-filters.mapper.js';
import type { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { TaskFilters } from '#src/tasks/types/find-task-options.type.js';
import type { CreateTaskInput } from '#src/tasks/types/input/create-task.input.js';
import type { UpdateTaskDetailsInput } from '#src/tasks/types/input/update-task-details.input.js';
import type { Task } from '#src/tasks/types/task.type.js';
import {
  isDeleteResponse,
  isTask,
  isTaskList,
} from '#src/tasks/validators/task-response.validator.js';

export const tasksApi = {
  findAll(
    this: void,
    filters: TaskFilters = {},
    signal?: AbortSignal,
  ): Promise<Task[]> {
    return request(
      buildTasksPath(filters),
      { ...(signal ? { signal } : {}), cache: 'no-store' },
      isTaskList,
    );
  },

  findByUuid(this: void, uuid: string, signal?: AbortSignal): Promise<Task> {
    return request(
      `/tasks/${encodeURIComponent(uuid)}`,
      { ...(signal ? { signal } : {}), cache: 'no-store' },
      isTask,
    );
  },

  create(this: void, input: CreateTaskInput): Promise<Task> {
    const { name, priority, description, parentUuid, start, end, reminder } =
      input;
    return request(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          priority,
          description,
          parentUuid,
          start,
          end,
          reminder,
        }),
      },
      isTask,
    );
  },

  updateDetails(
    this: void,
    uuid: string,
    input: UpdateTaskDetailsInput,
  ): Promise<Task> {
    const { name, priority, description, start, end, reminder } = input;
    return request(
      `/tasks/${encodeURIComponent(uuid)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          priority,
          description,
          start,
          end,
          reminder,
        }),
      },
      isTask,
    );
  },

  updateStatus(this: void, uuid: string, status: TaskStatus): Promise<Task> {
    return request(
      `/tasks/${encodeURIComponent(uuid)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      isTask,
    );
  },

  async delete(this: void, uuid: string): Promise<void> {
    await request(
      `/tasks/${encodeURIComponent(uuid)}`,
      { method: 'DELETE' },
      isDeleteResponse,
    );
  },
};
