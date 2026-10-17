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
    return 'Las tareas completadas y canceladas son de solo lectura.';
  }
  if (target === TaskStatus.SCHEDULED && task.start === null) {
    return 'Para programar la tarea, añade primero una fecha de inicio.';
  }

  if (task.parentUuid !== null) {
    const parent = family.find((item) => item.uuid === task.parentUuid);
    if (!parent) {
      return 'No se ha podido cargar la principal. Recarga antes de cambiar el estado.';
    }
    if (!allowedSubtaskStatuses[parent.status].includes(target)) {
      return `El estado ${taskStatusLabels[target].toLowerCase()} no es compatible con la principal ${taskStatusLabels[parent.status].toLowerCase()}.`;
    }
    return null;
  }

  const subtasks = family.filter((item) => item.parentUuid === task.uuid);
  if (target === TaskStatus.CANCELLED) {
    return subtasks.some((item) => item.status === TaskStatus.COMPLETED)
      ? 'No se puede cancelar una tarea que tiene subtareas completadas.'
      : null;
  }
  if (
    subtasks.some(
      (item) => !allowedSubtaskStatuses[target].includes(item.status),
    )
  ) {
    return target === TaskStatus.COMPLETED
      ? 'Para completar la tarea, completa o cancela todas sus subtareas.'
      : `Hay subtareas incompatibles con el estado ${taskStatusLabels[target].toLowerCase()}. Revisa sus estados primero.`;
  }

  return null;
}
