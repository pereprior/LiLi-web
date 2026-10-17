import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactElement, ReactNode } from 'react';

import type {
  TaskContext,
  TaskQuery,
} from '#src/tasks/hooks/data/use-task-data.js';

type TaskDetailDialogProps = {
  open: boolean;
  detail: TaskQuery<TaskContext>;
  busy: boolean;
  error: string | null;
  saved: boolean;
  onClose: () => void;
  onReload: () => void;
  children: ReactNode;
};

export function TaskDetailDialog({
  open,
  detail,
  busy,
  error,
  saved,
  onClose,
  onReload,
  children,
}: TaskDetailDialogProps): ReactElement {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="task-detail-title"
    >
      <DialogTitle id="task-detail-title">Detalle de tarea</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {detail.status === 'loading' && (
            <Stack direction="row" spacing={2} role="status" sx={{ py: 3 }}>
              <CircularProgress size={24} />
              <Typography>Cargando detalle y subtareas…</Typography>
            </Stack>
          )}
          {detail.status === 'error' && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={onReload}>
                  Reintentar
                </Button>
              }
            >
              {saved
                ? 'La operación se guardó, pero no se pudo actualizar el detalle. No la repitas. '
                : ''}
              {detail.code === 404
                ? 'La tarea ya no está disponible. Vuelve a la lista o recarga.'
                : detail.message}
            </Alert>
          )}
          {children}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Volver a la lista
        </Button>
      </DialogActions>
    </Dialog>
  );
}
