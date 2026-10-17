import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

export function Brand(): ReactElement {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box
        component="img"
        src="/lili-symbol.png"
        alt=""
        width={48}
        height={48}
        sx={{ objectFit: 'contain' }}
      />
      <Box>
        <Typography
          component="span"
          variant="h5"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          LiLi
        </Typography>
        <Typography variant="caption" component="p" color="text.secondary">
          Un poco de calma para tu día
        </Typography>
      </Box>
    </Stack>
  );
}
