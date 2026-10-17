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

import { TaskForm } from '#src/tasks/components/form/task-form.js';
import type {
  TaskEditor,
  UncertainCreation,
} from '#src/tasks/hooks/actions/use-task-actions.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from '#src/tasks/types/task.types.js';

type TaskEditorDialogProps = {
  editor: TaskEditor | null;
  busy: boolean;
  error: string | null;
  uncertainCreation: UncertainCreation | null;
  onClose: () => void;
  onSave: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onReviewCreation: () => Promise<void>;
  onSelectExisting: (uuid: string) => void;
};

export function TaskEditorDialog({
  editor,
  busy,
  error,
  uncertainCreation,
  onClose,
  onSave,
  onReviewCreation,
  onSelectExisting,
}: TaskEditorDialogProps): ReactElement {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const task = editor?.kind === 'edit' ? editor.task : undefined;
  const parentUuid = editor?.kind === 'create' ? editor.parentUuid : undefined;
  let title = 'Añadir tarea';
  if (task) title = 'Editar tarea';
  else if (parentUuid) title = 'Añadir subtarea';

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
        {uncertainCreation && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Comprueba si tu tarea está en la lista antes de volver a guardar.
            {uncertainCreation.tasks === null ? (
              <Button
                disabled={uncertainCreation.checking}
                onClick={() => void onReviewCreation()}
              >
                {uncertainCreation.checking
                  ? 'Comprobando…'
                  : 'Comprobar lista'}
              </Button>
            ) : (
              <>
                <Typography variant="body2">
                  Lista comprobada. Si ya está creada, ábrela; si no está,
                  puedes volver a guardar.
                </Typography>
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
            submitBlocked={uncertainCreation?.tasks === null}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
