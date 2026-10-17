import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { TaskForm } from '#src/tasks/components/form/task-form.js';
import type { CreateTaskInput } from '#src/tasks/types/input/create-task.input.js';
import type { UpdateTaskDetailsInput } from '#src/tasks/types/input/update-task-details.input.js';
import type {
  TaskEditor,
  UncertainCreation,
} from '#src/tasks/types/task-actions.type.js';
import type {
  TaskContext,
  TaskQuery,
} from '#src/tasks/types/task-query.type.js';

type TaskEditorDialogProps = {
  editor: TaskEditor | null;
  context: TaskQuery<TaskContext>;
  busy: boolean;
  error: string | null;
  uncertainCreation: UncertainCreation | null;
  onClose: () => void;
  onReload: () => void;
  onSave: (input: CreateTaskInput | UpdateTaskDetailsInput) => Promise<void>;
  onReviewCreation: () => Promise<void>;
  onSelectExisting: (uuid: string) => void;
};

export function TaskEditorDialog({
  editor,
  context,
  busy,
  error,
  uncertainCreation,
  onClose,
  onReload,
  onSave,
  onReviewCreation,
  onSelectExisting,
}: TaskEditorDialogProps): ReactElement {
  const { t } = useTranslation('tasks');
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const editing = editor?.kind === 'edit';
  const currentTask =
    editing &&
    context.status === 'ready' &&
    context.data.task.uuid === editor.task.uuid
      ? context.data.task
      : undefined;
  const task = editing ? (currentTask ?? editor.task) : undefined;
  const parentUuid = editor?.kind === 'create' ? editor.parentUuid : undefined;
  let title = t('actions.addTask');
  if (task) title = t('actions.editTask');
  else if (parentUuid) title = t('actions.addSubtask');

  return (
    <Dialog
      open={editor !== null}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="task-form-title"
      slotProps={{
        transition: {
          onEntered: (node: HTMLElement): void => {
            node.querySelector<HTMLInputElement>('input')?.focus();
          },
        },
      }}
    >
      <DialogTitle id="task-form-title">{title}</DialogTitle>
      <DialogContent>
        {editing && context.status === 'loading' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('detail.loading')}
          </Alert>
        )}
        {editing && context.status === 'error' && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" onClick={onReload}>
                {t('actions.retry')}
              </Button>
            }
          >
            {context.code === 404 ? t('detail.unavailable') : context.message}
          </Alert>
        )}
        {uncertainCreation && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {t('editor.checkBeforeSaving')}
            {uncertainCreation.tasks === null ? (
              <Button
                disabled={uncertainCreation.checking}
                onClick={() => void onReviewCreation()}
              >
                {uncertainCreation.checking
                  ? t('editor.checking')
                  : t('editor.checkList')}
              </Button>
            ) : (
              <>
                <Typography variant="body2">{t('editor.checked')}</Typography>
                <Stack sx={{ maxHeight: 180, overflowY: 'auto' }}>
                  {uncertainCreation.tasks.map((existingTask) => (
                    <Button
                      key={existingTask.uuid}
                      onClick={() => onSelectExisting(existingTask.uuid)}
                    >
                      {existingTask.name}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
          </Alert>
        )}
        {editor && (
          <TaskForm
            key={task?.uuid ?? `create:${parentUuid ?? ''}`}
            task={task}
            parentUuid={parentUuid}
            onSubmit={onSave}
            onCancel={onClose}
            submitting={busy}
            submitBlocked={
              (editing && currentTask === undefined) ||
              uncertainCreation?.tasks === null
            }
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
