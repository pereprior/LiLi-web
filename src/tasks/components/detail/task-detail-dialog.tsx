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
import { useTranslation } from 'react-i18next';

import type {
  TaskContext,
  TaskQuery,
} from '#src/tasks/types/task-query.type.js';

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
  const { t } = useTranslation('tasks');
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
      <DialogTitle id="task-detail-title">{t('detail.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {detail.status === 'loading' && (
            <Stack direction="row" spacing={2} role="status" sx={{ py: 3 }}>
              <CircularProgress size={24} />
              <Typography>{t('detail.loading')}</Typography>
            </Stack>
          )}
          {detail.status === 'error' && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={onReload}>
                  {t('actions.retry')}
                </Button>
              }
            >
              {saved ? `${t('detail.savedRefreshError')} ` : ''}
              {detail.code === 404 ? t('detail.unavailable') : detail.message}
            </Alert>
          )}
          {children}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          {t('actions.backToList')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
