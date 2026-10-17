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
  if (tasks.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {filtered
            ? 'No hay coincidencias'
            : 'Un poco de espacio para organizarte'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {filtered
            ? 'Prueba con otra búsqueda o limpia los filtros.'
            : 'Añade tu primera tarea y deja que LiLi te ayude a tenerla presente.'}
        </Typography>
        <Button
          variant="contained"
          onClick={filtered ? onClearFilters : onCreate}
        >
          {filtered ? 'Limpiar filtros' : 'Añadir tarea'}
        </Button>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <List disablePadding aria-label="Tareas">
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
                        label={`Prioridad ${taskPriorityLabels[task.priority].toLowerCase()}`}
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
                        Subtarea · ver principal en el detalle
                      </Typography>
                    )}
                    {task.start && (
                      <Typography variant="body2" color="text.secondary">
                        Inicio: {formatTaskDate(task.start)}
                      </Typography>
                    )}
                    {task.end && (
                      <Typography variant="body2" color="text.secondary">
                        Fin: {formatTaskDate(task.end)}
                      </Typography>
                    )}
                    {task.reminder && (
                      <Typography variant="body2" color="text.secondary">
                        Recordatorio: {formatTaskDate(task.reminder)}
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
