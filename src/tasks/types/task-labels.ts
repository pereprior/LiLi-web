import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

export const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pendiente',
  [TaskStatus.SCHEDULED]: 'Programada',
  [TaskStatus.IN_PROGRESS]: 'En curso',
  [TaskStatus.PAUSED]: 'Pausada',
  [TaskStatus.BLOCKED]: 'Bloqueada',
  [TaskStatus.COMPLETED]: 'Completada',
  [TaskStatus.CANCELLED]: 'Cancelada',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Baja',
  [TaskPriority.MEDIUM]: 'Media',
  [TaskPriority.HIGH]: 'Alta',
};
