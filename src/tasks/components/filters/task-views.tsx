import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { TaskFilters, TaskView } from '#src/tasks/types/task.types.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

type View = TaskView | 'all' | 'closed';
const views: View[] = ['all', 'overdue', 'today', 'upcoming', 'closed'];

type TaskViewsProps = {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
};

export function TaskViews({ filters, onChange }: TaskViewsProps): ReactElement {
  const { t } = useTranslation('tasks');
  let selectedView: View | null = null;
  if (filters.view) selectedView = filters.view;
  else if (
    filters.status?.length === 2 &&
    filters.status.includes(TaskStatus.COMPLETED) &&
    filters.status.includes(TaskStatus.CANCELLED)
  )
    selectedView = 'closed';
  else if (
    !filters.search?.trim() &&
    !filters.status?.length &&
    !filters.dateField &&
    !filters.dateFrom &&
    !filters.dateTo
  )
    selectedView = 'all';

  function chooseView(view: View): void {
    const nextFilters: TaskFilters = {};
    if (filters.search) nextFilters.search = filters.search;
    if (filters.sortBy) nextFilters.sortBy = filters.sortBy;
    if (filters.sortDirection)
      nextFilters.sortDirection = filters.sortDirection;
    if (view === 'closed')
      nextFilters.status = [TaskStatus.COMPLETED, TaskStatus.CANCELLED];
    else if (view !== 'all') nextFilters.view = view;
    onChange(nextFilters);
  }

  return (
    <Stack
      component="nav"
      aria-label={t('views.label')}
      direction="row"
      useFlexGap
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      {views.map((view) => (
        <Button
          key={view}
          variant={selectedView === view ? 'contained' : 'outlined'}
          aria-pressed={selectedView === view}
          onClick={() => chooseView(view)}
        >
          {t(`views.${view}`)}
        </Button>
      ))}
    </Stack>
  );
}
