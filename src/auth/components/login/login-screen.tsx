import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

type LoginScreenProps = {
  onRetry?: () => void;
  error?: string;
  checking?: boolean;
};

export function LoginScreen({
  onRetry,
  error,
  checking = false,
}: LoginScreenProps): ReactElement {
  return (
    <Paper
      variant="outlined"
      sx={{ maxWidth: 480, mx: 'auto', p: { xs: 3, sm: 4 } }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography component="h1" variant="h4">
            Un poco de orden para casa
          </Typography>
          <Typography color="text.secondary">
            Tus tareas, planes y recordatorios, en un mismo lugar.
          </Typography>
        </Stack>
        {checking ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center' }}
            role="status"
          >
            <CircularProgress size={24} aria-label="Comprobando sesión" />
            <Typography>Conectando con LiLi…</Typography>
          </Stack>
        ) : error ? (
          <Stack spacing={2}>
            <Alert severity="error">{error}</Alert>
            {onRetry ? (
              <Button variant="outlined" onClick={onRetry}>
                Volver a comprobar
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Button href="/auth/google" variant="contained" size="large">
              Entrar con Google
            </Button>
            <Typography variant="body2" color="text.secondary">
              LiLi es un espacio privado para casa. Accede con una cuenta de
              Google autorizada.
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
