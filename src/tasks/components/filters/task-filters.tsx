import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type ReactElement, useState } from 'react';

import type { TaskFilters } from '#src/tasks/types/task.types.js';
import { taskStatusLabels } from '#src/tasks/types/task-labels.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

type TaskFiltersProps = {
  filters: TaskFilters;
  onApply: (filters: TaskFilters) => void;
};

export function TaskFilters({
  filters,
  onApply,
}: TaskFiltersProps): ReactElement {
  const [draft, setDraft] = useState<TaskFilters>(filters);
  const [error, setError] = useState('');

  function apply(): void {
    if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      setError('El último día no puede ser anterior al primero.');
      return;
    }
    setError('');
    onApply(draft);
  }

  return (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{ '&::before': { display: 'none' } }}
    >
      <AccordionSummary
        aria-controls="task-filters-content"
        id="task-filters-heading"
      >
        <Typography component="h2" variant="subtitle2">
          Buscar, filtrar y ordenar +
        </Typography>
      </AccordionSummary>
      <AccordionDetails id="task-filters-content">
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <Stack spacing={3}>
            <TextField
              label="Buscar tareas"
              type="search"
              value={draft.search ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, search: event.target.value })
              }
              helperText="Busca en el nombre o la descripción."
            />
            <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
              <Typography component="legend" variant="body2">
                Estados
              </Typography>
              <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
                {Object.values(TaskStatus).map((status) => (
                  <FormControlLabel
                    key={status}
                    label={taskStatusLabels[status]}
                    control={
                      <Checkbox
                        checked={draft.status?.includes(status) ?? false}
                        onChange={(_, checked) => {
                          const manual = { ...draft };
                          delete manual.view;
                          setDraft({
                            ...manual,
                            status: checked
                              ? [...(draft.status ?? []), status]
                              : (draft.status?.filter(
                                  (value) => value !== status,
                                ) ?? []),
                          });
                        }}
                      />
                    }
                  />
                ))}
              </Stack>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Fecha por"
                value={draft.dateField ?? ''}
                onChange={(event) => {
                  const manual = { ...draft };
                  delete manual.view;
                  delete manual.dateField;
                  setDraft(
                    event.target.value === ''
                      ? manual
                      : {
                          ...manual,
                          dateField: event.target.value as 'start' | 'end',
                        },
                  );
                }}
                slotProps={{ select: { native: true } }}
                sx={{ flex: 1 }}
              >
                <option value="">Sin filtro de fecha</option>
                <option value="start">Inicio</option>
                <option value="end">Fin</option>
              </TextField>
              <TextField
                label="Desde el día"
                type="date"
                value={draft.dateFrom ?? ''}
                onChange={(event) => {
                  const manual = { ...draft };
                  delete manual.view;
                  setDraft({ ...manual, dateFrom: event.target.value });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!error}
                helperText={error || 'Día incluido · Madrid'}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Hasta el día"
                type="date"
                value={draft.dateTo ?? ''}
                onChange={(event) => {
                  const manual = { ...draft };
                  delete manual.view;
                  setDraft({ ...manual, dateTo: event.target.value });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!error}
                helperText="Día incluido · Madrid"
                sx={{ flex: 1 }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Ordenar por"
                value={draft.sortBy ?? 'createdAt'}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    sortBy: event.target.value as TaskFilters['sortBy'] &
                      string,
                  })
                }
                slotProps={{ select: { native: true } }}
                sx={{ flex: 1 }}
              >
                <option value="createdAt">Creación</option>
                <option value="priority">Prioridad</option>
                <option value="start">Inicio</option>
                <option value="end">Fin</option>
              </TextField>
              <TextField
                select
                label="Sentido"
                value={draft.sortDirection ?? 'asc'}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    sortDirection: event.target.value as 'asc' | 'desc',
                  })
                }
                slotProps={{ select: { native: true } }}
                sx={{ flex: 1 }}
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                Aplicar filtros
              </Button>
              <Button onClick={() => onApply({})}>Limpiar filtros</Button>
            </Stack>
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
