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
import { useTranslation } from 'react-i18next';

import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { TaskFilters } from '#src/tasks/types/find-task-options.type.js';
import { taskStatusLabels } from '#src/tasks/utils/task-labels.utils.js';

type TaskFiltersProps = {
  filters: TaskFilters;
  onApply: (filters: TaskFilters) => void;
};

export function TaskFilters({
  filters,
  onApply,
}: TaskFiltersProps): ReactElement {
  const { t } = useTranslation('tasks');
  const [draft, setDraft] = useState<TaskFilters>(filters);
  const [hasDateError, setHasDateError] = useState(false);

  function apply(): void {
    if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      setHasDateError(true);
      return;
    }
    setHasDateError(false);
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
          {t('filters.title')}
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
              label={t('filters.search')}
              type="search"
              value={draft.search ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, search: event.target.value })
              }
              helperText={t('filters.searchHelp')}
            />
            <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
              <Typography component="legend" variant="body2">
                {t('filters.statuses')}
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
                label={t('filters.dateField')}
                value={draft.dateField ?? ''}
                onChange={(event) => {
                  const manual = { ...draft };
                  delete manual.view;
                  delete manual.dateField;
                  if (event.target.value === '') {
                    delete manual.dateFrom;
                    delete manual.dateTo;
                  }
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
                <option value="">{t('filters.noDateFilter')}</option>
                <option value="start">{t('dates.start.label')}</option>
                <option value="end">{t('dates.end.label')}</option>
              </TextField>
              <TextField
                label={t('filters.dateFrom')}
                type="date"
                value={draft.dateFrom ?? ''}
                onChange={(event) => {
                  const manual = { ...draft };
                  delete manual.view;
                  setDraft({ ...manual, dateFrom: event.target.value });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                error={hasDateError}
                helperText={
                  hasDateError
                    ? t('filters.invalidDateRange')
                    : t('filters.inclusiveDay')
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label={t('filters.dateTo')}
                type="date"
                value={draft.dateTo ?? ''}
                onChange={(event) => {
                  const manual = { ...draft };
                  delete manual.view;
                  setDraft({ ...manual, dateTo: event.target.value });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                error={hasDateError}
                helperText={t('filters.inclusiveDay')}
                sx={{ flex: 1 }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label={t('filters.sortBy')}
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
                <option value="createdAt">{t('filters.createdAt')}</option>
                <option value="priority">{t('form.priority')}</option>
                <option value="start">{t('dates.start.label')}</option>
                <option value="end">{t('dates.end.label')}</option>
              </TextField>
              <TextField
                select
                label={t('filters.sortDirection')}
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
                <option value="asc">{t('filters.ascending')}</option>
                <option value="desc">{t('filters.descending')}</option>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                {t('filters.apply')}
              </Button>
              <Button onClick={() => onApply({})}>{t('filters.clear')}</Button>
            </Stack>
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
