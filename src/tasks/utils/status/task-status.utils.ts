import { i18n } from '#src/shared/i18n/i18n.js';
import type { Task } from '#src/tasks/types/task.types.js';
import { taskStatusLabels } from '#src/tasks/types/task-labels.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

const allowedSubtaskStatuses: Record<TaskStatus, readonly TaskStatus[]> = {
  [TaskStatus.PENDING]: [TaskStatus.PENDING],
  [TaskStatus.SCHEDULED]: [TaskStatus.PENDING, TaskStatus.SCHEDULED],
  [TaskStatus.IN_PROGRESS]: Object.values(TaskStatus),
  [TaskStatus.PAUSED]: Object.values(TaskStatus),
  [TaskStatus.BLOCKED]: Object.values(TaskStatus),
  [TaskStatus.COMPLETED]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
  [TaskStatus.CANCELLED]: [TaskStatus.CANCELLED],
};

export function isTerminalStatus(status: TaskStatus): boolean {
  return status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED;
}

export function getStatusChangeReason(
  task: Task,
  target: TaskStatus,
  family: Task[],
): string | null {
  if (target === task.status) return null;
  if (isTerminalStatus(task.status)) {
    return i18n.t('tasks:statusReasons.terminal');
  }
  if (target === TaskStatus.SCHEDULED && task.start === null) {
    return i18n.t('tasks:statusReasons.startRequired');
  }

  if (task.parentUuid !== null) {
    const parent = family.find((item) => item.uuid === task.parentUuid);
    if (!parent) {
      return i18n.t('tasks:statusReasons.parentUnavailable');
    }
    if (!allowedSubtaskStatuses[parent.status].includes(target)) {
      return i18n.t('tasks:statusReasons.parentIncompatible', {
        status: taskStatusLabels[target].toLocaleLowerCase(
          i18n.resolvedLanguage,
        ),
        parentStatus: taskStatusLabels[parent.status].toLocaleLowerCase(
          i18n.resolvedLanguage,
        ),
      });
    }
    return null;
  }

  const subtasks = family.filter((item) => item.parentUuid === task.uuid);
  if (target === TaskStatus.CANCELLED) {
    return subtasks.some((item) => item.status === TaskStatus.COMPLETED)
      ? i18n.t('tasks:statusReasons.completedSubtasks')
      : null;
  }
  if (
    subtasks.some(
      (item) => !allowedSubtaskStatuses[target].includes(item.status),
    )
  ) {
    return target === TaskStatus.COMPLETED
      ? i18n.t('tasks:statusReasons.finishSubtasks')
      : i18n.t('tasks:statusReasons.subtasksIncompatible', {
          status: taskStatusLabels[target].toLocaleLowerCase(
            i18n.resolvedLanguage,
          ),
        });
  }

  return null;
}
