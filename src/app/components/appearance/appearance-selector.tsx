import { useColorScheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import type { ReactElement } from 'react';

export function AppearanceSelector(): ReactElement {
  const { mode, setMode } = useColorScheme();
  return (
    <TextField
      select
      size="small"
      label="Apariencia"
      value={mode ?? 'system'}
      disabled={mode === undefined}
      onChange={(event) =>
        setMode(event.target.value as 'light' | 'dark' | 'system')
      }
      slotProps={{ select: { native: true } }}
      sx={{ minWidth: 120 }}
    >
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
      <option value="system">Sistema</option>
    </TextField>
  );
}
