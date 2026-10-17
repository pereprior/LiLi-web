import { useColorScheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function AppearanceSelector(): ReactElement {
  const { t } = useTranslation('app');
  const { mode, setMode } = useColorScheme();
  return (
    <TextField
      select
      size="small"
      label={t('appearance.label')}
      value={mode ?? 'system'}
      disabled={mode === undefined}
      onChange={(event) =>
        setMode(event.target.value as 'light' | 'dark' | 'system')
      }
      slotProps={{ select: { native: true } }}
      sx={{ minWidth: 120 }}
    >
      <option value="light">{t('appearance.light')}</option>
      <option value="dark">{t('appearance.dark')}</option>
      <option value="system">{t('appearance.system')}</option>
    </TextField>
  );
}
