import { useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '#src/shared/http/error-message.js';
import { HttpError } from '#src/shared/http/http-client.js';
import { tasksApi } from '#src/tasks/api/tasks.api.js';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '#src/tasks/types/task.types.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

export type TaskEditor =
  { kind: 'create'; parentUuid?: string } | { kind: 'edit'; task: Task };
export type TaskConfirmation = { kind: 'delete' | 'cancel'; task: Task };
export type UncertainCreation = { tasks: Task[] | null; checking: boolean };
type TaskActions = {
  editor: TaskEditor | null;
  confirmation: TaskConfirmation | null;
  busy: boolean;
  mutationError: string | null;
  notice: string | null;
  uncertainCreation: UncertainCreation | null;
  openEditor: (value: TaskEditor) => void;
  closeEditor: () => void;
  clearError: () => void;
  dismissNotice: () => void;
  requestDelete: (task: Task) => void;
  requestStatusChange: (task: Task, status: TaskStatus) => void;
  closeConfirmation: () => void;
  confirmAction: () => Promise<void>;
  selectExistingTask: (uuid: string) => void;
  save: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  reviewCreation: () => Promise<void>;
};

type TaskActionsOptions = {
  filtered: boolean;
  selectTask: (uuid: string | null) => void;
  refresh: () => void;
  onUnauthorized: () => void;
};

export function useTaskActions({
  filtered,
  selectTask,
  refresh,
  onUnauthorized,
}: TaskActionsOptions): TaskActions {
  const [editor, setEditor] = useState<TaskEditor | null>(null);
  const [confirmation, setConfirmation] = useState<TaskConfirmation | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uncertainCreation, setUncertainCreation] =
    useState<UncertainCreation | null>(null);
  const active = useRef(false);
  const writing = useRef(false);
  useEffect(() => {
    active.current = true;
    return (): void => {
      active.current = false;
    };
  }, []);

  function openEditor(value: TaskEditor): void {
    setNotice(null);
    setMutationError(null);
    setUncertainCreation(null);
    setEditor(value);
  }

  function closeEditor(): void {
    if (busy) return;
    setEditor(null);
    setMutationError(null);
    setUncertainCreation(null);
  }

  function clearError(): void {
    setMutationError(null);
  }

  function dismissNotice(): void {
    setNotice(null);
  }

  function requestDelete(task: Task): void {
    if (writing.current) return;
    clearError();
    setConfirmation({ kind: 'delete', task });
  }

  function requestStatusChange(task: Task, status: TaskStatus): void {
    if (writing.current) return;
    clearError();
    if (status === TaskStatus.CANCELLED && task.parentUuid === null) {
      setConfirmation({ kind: 'cancel', task });
      return;
    }
    void changeStatus(task, status);
  }

  function closeConfirmation(): void {
    if (writing.current) return;
    setConfirmation(null);
    clearError();
  }

  async function confirmAction(): Promise<void> {
    if (!confirmation) return;
    if (confirmation.kind === 'delete') await remove(confirmation.task);
    else await changeStatus(confirmation.task, TaskStatus.CANCELLED);
  }

  function selectExistingTask(uuid: string): void {
    if (writing.current) return;
    closeEditor();
    selectTask(uuid);
  }

  function handleError(error: unknown): void {
    if (!active.current) return;
    if (error instanceof HttpError && error.status === 401) {
      onUnauthorized();
      return;
    }
    setMutationError(getErrorMessage(error));
    if (
      error instanceof HttpError &&
      (error.status === 409 || error.status === 404)
    )
      refresh();
  }

  async function save(input: CreateTaskInput | UpdateTaskInput): Promise<void> {
    if (!editor || writing.current || uncertainCreation?.tasks === null) return;
    writing.current = true;
    setBusy(true);
    setMutationError(null);
    setNotice(null);
    try {
      const saved =
        editor.kind === 'edit'
          ? await tasksApi.update(editor.task.uuid, input)
          : await tasksApi.create(input as CreateTaskInput);
      if (!active.current) return;
      setEditor(null);
      setUncertainCreation(null);
      setNotice(
        `${editor.kind === 'create' ? 'Tarea creada.' : 'Cambios guardados.'}${saved.reminder ? ' Recordatorio guardado.' : ''}${filtered ? ' La consulta actual puede excluir esta tarea; puedes verla en el detalle.' : ''}`,
      );
      selectTask(saved.uuid);
      refresh();
    } catch (error) {
      handleError(error);
      if (
        active.current &&
        editor.kind === 'create' &&
        (!(error instanceof HttpError) ||
          error.status === 0 ||
          error.status >= 500 ||
          (error.status >= 200 && error.status < 300))
      ) {
        setUncertainCreation({ tasks: null, checking: false });
        setMutationError(
          'No se ha recibido una confirmación. La tarea podría haberse creado. Comprueba la lista antes de intentarlo otra vez.',
        );
      }
    } finally {
      writing.current = false;
      if (active.current) setBusy(false);
    }
  }

  async function reviewCreation(): Promise<void> {
    setUncertainCreation({ tasks: null, checking: true });
    try {
      const tasks = await tasksApi.list();
      if (!active.current) return;
      setUncertainCreation({ tasks, checking: false });
      refresh();
    } catch (error) {
      handleError(error);
      if (active.current)
        setUncertainCreation({ tasks: null, checking: false });
    }
  }

  async function changeStatus(task: Task, status: TaskStatus): Promise<void> {
    if (writing.current) return;
    writing.current = true;
    setBusy(true);
    setMutationError(null);
    setNotice(null);
    try {
      await tasksApi.updateStatus(task.uuid, status);
      if (!active.current) return;
      setConfirmation(null);
      setNotice(
        'Estado actualizado. Los avisos pendientes se anulan al completar o cancelar.',
      );
      refresh();
    } catch (error) {
      handleError(error);
    } finally {
      writing.current = false;
      if (active.current) setBusy(false);
    }
  }

  async function remove(task: Task): Promise<void> {
    if (writing.current) return;
    writing.current = true;
    setBusy(true);
    setMutationError(null);
    setNotice(null);
    try {
      await tasksApi.remove(task.uuid);
      if (!active.current) return;
      setConfirmation(null);
      setEditor(null);
      selectTask(null);
      setNotice('Tarea eliminada. Sus avisos pendientes se han anulado.');
      refresh();
    } catch (error) {
      handleError(error);
    } finally {
      writing.current = false;
      if (active.current) setBusy(false);
    }
  }

  return {
    editor,
    confirmation,
    busy,
    mutationError,
    notice,
    uncertainCreation,
    openEditor,
    closeEditor,
    clearError,
    dismissNotice,
    requestDelete,
    requestStatusChange,
    closeConfirmation,
    confirmAction,
    selectExistingTask,
    save,
    reviewCreation,
  };
}
