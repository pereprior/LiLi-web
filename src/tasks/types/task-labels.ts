import { i18n } from '#src/shared/i18n/i18n.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

export const taskStatusLabels: Record<TaskStatus, string> = {
  get [TaskStatus.PENDING](): string {
    return i18n.t('tasks:labels.status.PENDING');
  },
  get [TaskStatus.SCHEDULED](): string {
    return i18n.t('tasks:labels.status.SCHEDULED');
  },
  get [TaskStatus.IN_PROGRESS](): string {
    return i18n.t('tasks:labels.status.IN_PROGRESS');
  },
  get [TaskStatus.PAUSED](): string {
    return i18n.t('tasks:labels.status.PAUSED');
  },
  get [TaskStatus.BLOCKED](): string {
    return i18n.t('tasks:labels.status.BLOCKED');
  },
  get [TaskStatus.COMPLETED](): string {
    return i18n.t('tasks:labels.status.COMPLETED');
  },
  get [TaskStatus.CANCELLED](): string {
    return i18n.t('tasks:labels.status.CANCELLED');
  },
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  get [TaskPriority.LOW](): string {
    return i18n.t('tasks:labels.priority.LOW');
  },
  get [TaskPriority.MEDIUM](): string {
    return i18n.t('tasks:labels.priority.MEDIUM');
  },
  get [TaskPriority.HIGH](): string {
    return i18n.t('tasks:labels.priority.HIGH');
  },
};
