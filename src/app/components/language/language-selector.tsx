import TextField from '@mui/material/TextField';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSelector(): ReactElement {
  const { t, i18n } = useTranslation('app');

  return (
    <TextField
      select
      size="small"
      label={t('language')}
      value={i18n.resolvedLanguage ?? 'en'}
      onChange={(event) => void i18n.changeLanguage(event.target.value)}
      slotProps={{ select: { native: true } }}
      sx={{ minWidth: 120 }}
    >
      <option value="en" lang="en">
        English
      </option>
      <option value="es" lang="es">
        Español
      </option>
      <option value="ca-valencia" lang="ca-valencia">
        Valencià
      </option>
    </TextField>
  );
}
