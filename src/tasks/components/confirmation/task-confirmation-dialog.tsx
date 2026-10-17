import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { TaskConfirmation } from '#src/tasks/types/task-actions.type.js';

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
  const { t } = useTranslation('tasks');
  const deleting = confirmation?.kind === 'delete';
  const title = deleting
    ? t('actions.deleteTask')
    : t('confirmation.cancelTitle');
  const confirmLabel = deleting
    ? t('confirmation.delete')
    : t('confirmation.cancelConfirm');
  let description = '';
  if (confirmation) {
    const { task } = confirmation;
    if (deleting) {
      description = t('confirmation.deleteDescription', { name: task.name });
      if (task.parentUuid === null)
        description += ` ${t('confirmation.deleteSubtasks')}`;
      description += ` ${t('confirmation.irreversible')}`;
    } else {
      description = t('confirmation.cancelDescription', { name: task.name });
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
          {description} {t('confirmation.reminders')}
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          {t('actions.back')}
        </Button>
        <Button
          color={deleting ? 'error' : 'primary'}
          variant="contained"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {busy ? t('actions.saving') : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
