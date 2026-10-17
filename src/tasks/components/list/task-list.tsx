import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { Task } from '#src/tasks/types/task.types.js';
import {
  taskPriorityLabels,
  taskStatusLabels,
} from '#src/tasks/types/task-labels.js';
import { formatTaskDate } from '#src/tasks/utils/dates/task-display.utils.js';

type TaskListProps = {
  tasks: Task[];
  filtered: boolean;
  selectedUuid: string | null;
  onSelect: (uuid: string) => void;
  onClearFilters: () => void;
  onCreate: () => void;
};

export function TaskList({
  tasks,
  filtered,
  selectedUuid,
  onSelect,
  onClearFilters,
  onCreate,
}: TaskListProps): ReactElement {
  const { t, i18n } = useTranslation('tasks');
  if (tasks.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {filtered ? t('list.noMatches') : t('list.emptyTitle')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {filtered ? t('list.noMatchesHelp') : t('list.emptyHelp')}
        </Typography>
        <Button
          variant="contained"
          onClick={filtered ? onClearFilters : onCreate}
        >
          {filtered ? t('filters.clear') : t('actions.addTask')}
        </Button>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <List disablePadding aria-label={t('list.label')}>
        {tasks.map((task, index) => (
          <Box key={task.uuid}>
            {index > 0 && <Divider />}
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedUuid === task.uuid}
                onClick={() => onSelect(task.uuid)}
                sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
              >
                <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
                  <Stack
                    direction="row"
                    useFlexGap
                    sx={{
                      justifyContent: 'space-between',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      component="h3"
                      variant="subtitle1"
                      sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
                    >
                      {task.name}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={taskStatusLabels[task.status]}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={t('labels.priorityWithValue', {
                          priority: taskPriorityLabels[
                            task.priority
                          ].toLocaleLowerCase(i18n.resolvedLanguage),
                        })}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                  <Stack
                    direction="row"
                    useFlexGap
                    sx={{ gap: 2, flexWrap: 'wrap' }}
                  >
                    {task.parentUuid && (
                      <Typography variant="body2" color="primary">
                        {t('list.subtaskHelp')}
                      </Typography>
                    )}
                    {task.start && (
                      <Typography variant="body2" color="text.secondary">
                        {t('list.start', { date: formatTaskDate(task.start) })}
                      </Typography>
                    )}
                    {task.end && (
                      <Typography variant="body2" color="text.secondary">
                        {t('list.end', { date: formatTaskDate(task.end) })}
                      </Typography>
                    )}
                    {task.reminder && (
                      <Typography variant="body2" color="text.secondary">
                        {t('list.reminder', {
                          date: formatTaskDate(task.reminder),
                        })}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </ListItemButton>
            </ListItem>
          </Box>
        ))}
      </List>
    </Paper>
  );
}
