import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { TaskStatus } from '#src/tasks/types/enum/task-status.enum.js';
import type { Task } from '#src/tasks/types/task.type.js';
import { formatTaskDate } from '#src/tasks/utils/task-display.utils.js';
import {
  taskPriorityLabels,
  taskStatusLabels,
} from '#src/tasks/utils/task-labels.utils.js';
import {
  getStatusChangeReason,
  isTerminalStatus,
} from '#src/tasks/utils/task-state-rules.utils.js';

type TaskDetailProps = {
  task: Task;
  family: Task[];
  email: string;
  busy: boolean;
  onSelect: (uuid: string) => void;
  onEdit: () => void;
  onCreateSubtask: () => void;
  onChangeStatus: (status: TaskStatus) => void;
  onDelete: () => void;
};

export function TaskDetail({
  task,
  family,
  email,
  busy,
  onSelect,
  onEdit,
  onCreateSubtask,
  onChangeStatus,
  onDelete,
}: TaskDetailProps): ReactElement {
  const { t, i18n } = useTranslation('tasks');
  const terminal = isTerminalStatus(task.status);
  const parent = family.find((item) => item.uuid === task.parentUuid);
  const subtasks = family.filter((item) => item.parentUuid === task.uuid);
  const statuses = Object.values(TaskStatus).map((status) => ({
    status,
    reason: getStatusChangeReason(task, status, family),
  }));
  const reasons = [...new Set(statuses.map((item) => item.reason))].filter(
    (reason) => reason !== null,
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Box>
          {task.parentUuid !== null && (
            <Button
              disabled={busy}
              onClick={() => {
                if (task.parentUuid !== null) onSelect(task.parentUuid);
              }}
              sx={{ mb: 1 }}
            >
              {parent
                ? t('detail.viewNamedParent', { name: parent.name })
                : t('detail.viewParent')}
            </Button>
          )}
          <Typography
            component="h2"
            variant="h5"
            gutterBottom
            sx={{ overflowWrap: 'anywhere' }}
          >
            {task.name}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Chip label={taskStatusLabels[task.status]} variant="outlined" />
            <Chip
              label={t('labels.priorityWithValue', {
                priority: taskPriorityLabels[task.priority].toLocaleLowerCase(
                  i18n.resolvedLanguage,
                ),
              })}
            />
          </Stack>
        </Box>

        <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {task.description === null
            ? t('detail.noDescription')
            : task.description || t('detail.emptyDescription')}
        </Typography>

        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 2,
            rowGap: 1,
            '& dd': { m: 0 },
          }}
        >
          <Typography component="dt" color="text.secondary">
            {t('dates.start.label')}
          </Typography>
          <Typography component="dd">{formatTaskDate(task.start)}</Typography>
          <Typography component="dt" color="text.secondary">
            {t('dates.end.label')}
          </Typography>
          <Typography component="dd">{formatTaskDate(task.end)}</Typography>
          <Typography component="dt" color="text.secondary">
            {t('dates.reminder.label')}
          </Typography>
          <Typography component="dd">
            {formatTaskDate(task.reminder)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('detail.timezoneHelp')}
        </Typography>
        {task.reminder !== null && (
          <Alert severity="info">
            {t('detail.reminderRecipient', { email })}{' '}
            {task.reminder.time === null
              ? `${t('detail.reminderWithoutTime')} `
              : ''}
            {t('detail.reminderDeliveryHelp')}
            {terminal ? ` ${t('detail.terminalReminder')}` : ''}
          </Alert>
        )}

        {terminal ? (
          <Alert severity="info">{t('detail.readOnly')}</Alert>
        ) : (
          <Stack spacing={2}>
            <TextField
              select
              label={t('detail.status')}
              value={task.status}
              disabled={busy}
              slotProps={{ select: { native: true } }}
              onChange={(event) => {
                const selected = statuses.find(
                  (item) => String(item.status) === event.target.value,
                );
                if (
                  selected &&
                  selected.reason === null &&
                  selected.status !== task.status
                ) {
                  onChangeStatus(selected.status);
                }
              }}
              helperText={t('detail.statusHelp')}
            >
              {statuses.map(({ status, reason }) => (
                <option
                  key={status}
                  value={status}
                  disabled={reason !== null}
                  title={reason ?? undefined}
                >
                  {taskStatusLabels[status]}
                </option>
              ))}
            </TextField>
            {reasons.length > 0 && (
              <Box
                component="ul"
                sx={{ m: 0, pl: 2.5 }}
                aria-label={t('detail.statusConditions')}
              >
                {reasons.map((reason) => (
                  <Typography
                    key={reason}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                  >
                    {reason}
                  </Typography>
                ))}
              </Box>
            )}
            {task.start === null && (
              <Button onClick={onEdit} disabled={busy} variant="outlined">
                {t('detail.addStart')}
              </Button>
            )}
            {task.parentUuid === null && subtasks.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('detail.cancelSubtasksHelp')}
              </Typography>
            )}
          </Stack>
        )}

        {task.parentUuid === null && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography component="h3" variant="subtitle1" gutterBottom>
              {t('detail.subtasksCount', { count: subtasks.length })}
            </Typography>
            {subtasks.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                {t('detail.noSubtasks')}
              </Typography>
            ) : (
              <List disablePadding aria-label={t('detail.subtasks')}>
                {subtasks.map((subtask) => (
                  <ListItem key={subtask.uuid} disablePadding>
                    <ListItemButton
                      disabled={busy}
                      onClick={() => onSelect(subtask.uuid)}
                      sx={{ px: 1 }}
                    >
                      <Stack spacing={0.5}>
                        <Typography sx={{ overflowWrap: 'anywhere' }}>
                          {subtask.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('detail.subtaskSummary', {
                            status: taskStatusLabels[subtask.status],
                            priority: taskPriorityLabels[
                              subtask.priority
                            ].toLocaleLowerCase(i18n.resolvedLanguage),
                          })}
                        </Typography>
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            {!terminal && (
              <Button onClick={onCreateSubtask} disabled={busy} sx={{ mt: 1 }}>
                {t('actions.addSubtask')}
              </Button>
            )}
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
        >
          {!terminal && (
            <Button variant="contained" onClick={onEdit} disabled={busy}>
              {t('actions.editTask')}
            </Button>
          )}
          <Button color="error" onClick={onDelete} disabled={busy}>
            {t('actions.deleteTask')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
