import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('auth');
  return (
    <Paper
      variant="outlined"
      sx={{ maxWidth: 480, mx: 'auto', p: { xs: 3, sm: 4 } }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography component="h1" variant="h4">
            {t('title')}
          </Typography>
          <Typography color="text.secondary">{t('description')}</Typography>
        </Stack>
        {checking ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center' }}
            role="status"
          >
            <CircularProgress size={24} aria-label={t('checkingSession')} />
            <Typography>{t('connecting')}</Typography>
          </Stack>
        ) : error ? (
          <Stack spacing={2}>
            <Alert severity="error">{error}</Alert>
            {onRetry ? (
              <Button variant="outlined" onClick={onRetry}>
                {t('retry')}
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Button href="/auth/google" variant="contained" size="large">
              {t('signIn')}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {t('privateSpace')}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
