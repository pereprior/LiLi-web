import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { ReactElement } from 'react';

import type { TaskConfirmation } from '#src/tasks/hooks/actions/use-task-actions.js';

type TaskConfirmationDialogProps = {
  confirmation: TaskConfirmation | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function TaskConfirmationDialog({
  confirmation,
  busy,
  error,
  onClose,
  onConfirm,
}: TaskConfirmationDialogProps): ReactElement {
  const deleting = confirmation?.kind === 'delete';
  const title = deleting ? 'Eliminar tarea' : 'Cancelar tarea';
  const confirmLabel = deleting ? 'Eliminar' : 'Cancelar tarea y subtareas';
  let description = '';
  if (confirmation) {
    const { task } = confirmation;
    if (deleting) {
      description = `Se eliminará «${task.name}».`;
      if (task.parentUuid === null)
        description += ' También se eliminarán todas sus subtareas.';
      description += ' Esta acción no se puede deshacer.';
    } else {
      description = `Se cancelará «${task.name}» y todas sus subtareas visibles. Si alguna está completada, la operación se rechazará.`;
    }
  }

  return (
    <Dialog
      open={confirmation !== null}
      onClose={onClose}
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-description"
    >
      <DialogTitle id="confirmation-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-description">
          {description} Los avisos pendientes se anularán; un correo en curso no
          puede retirarse.
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Volver
        </Button>
        <Button
          color={deleting ? 'error' : 'primary'}
          variant="contained"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {busy ? 'Guardando…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
