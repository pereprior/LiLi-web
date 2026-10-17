import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FormEvent, ReactElement } from 'react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '#src/tasks/types/task.types.js';
import { taskPriorityLabels } from '#src/tasks/types/task-labels.js';
import { TaskPriority } from '#src/tasks/types/task-priority.enum.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';
import {
  buildCreateTaskInput,
  buildUpdateTaskInput,
  createTaskDraft,
  type TaskDateDraft,
  type TaskDraft,
  validateTaskDraft,
} from '#src/tasks/utils/form/task-form.utils.js';

export interface TaskFormProps {
  task?: Task | undefined;
  parentUuid?: string | undefined;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  submitBlocked?: boolean;
  error: string | null;
}

interface TaskDateFieldsProps {
  kind: 'start' | 'end' | 'reminder';
  value: TaskDateDraft;
  onChange: (value: TaskDateDraft) => void;
  disabled: boolean;
  error: string | undefined;
  reminder?: boolean;
}

function TaskDateFields({
  kind,
  value,
  onChange,
  disabled,
  error,
  reminder = false,
}: TaskDateFieldsProps): ReactElement {
  const { t } = useTranslation('tasks');
  const id = useId();
  return (
    <Box component="fieldset" sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}>
      <Typography component="legend" variant="subtitle2" sx={{ mb: 1.5 }}>
        {t(`dates.${kind}.label`)}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          id={`${id}-date`}
          label={t(`dates.${kind}.day`)}
          type="date"
          value={value.date}
          onChange={(event) => {
            const date = event.target.value;
            onChange({ date, time: date === '' ? '' : value.time });
          }}
          disabled={disabled}
          error={error !== undefined}
          helperText={error ?? t('form.optional')}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <TextField
          id={`${id}-time`}
          label={t(`dates.${kind}.time`)}
          type="time"
          value={value.time}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
          disabled={disabled || value.date === ''}
          helperText={t('form.optionalMadridTime')}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 60 } }}
          fullWidth
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        <Button
          size="small"
          disabled={disabled || value.date === ''}
          onClick={() => onChange({ date: '', time: '' })}
        >
          {t(`dates.${kind}.remove`)}
        </Button>
        <Button
          size="small"
          disabled={disabled || value.time === ''}
          onClick={() => onChange({ ...value, time: '' })}
        >
          {t(`dates.${kind}.removeTime`)}
        </Button>
      </Stack>
      {reminder ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('form.reminderHelp')}
        </Typography>
      ) : null}
    </Box>
  );
}

export function TaskForm({
  task,
  parentUuid,
  onSubmit,
  onCancel,
  submitting,
  submitBlocked = false,
  error,
}: TaskFormProps): ReactElement {
  const { t } = useTranslation('tasks');
  // The owner keys each editing session. Server refreshes must preserve its draft
  // and the original values used to decide which PATCH fields changed.
  const [original] = useState(task);
  const [draft, setDraft] = useState(() => createTaskDraft(task));
  const [showValidation, setShowValidation] = useState(false);
  const [submissionFailed, setSubmissionFailed] = useState(false);
  const id = useId();
  const terminal =
    task?.status === TaskStatus.COMPLETED ||
    task?.status === TaskStatus.CANCELLED;
  const validation = validateTaskDraft(draft, original);
  const errors = showValidation ? validation : {};
  const update =
    original === undefined ? null : buildUpdateTaskInput(draft, original);
  const unchanged = update !== null && Object.keys(update).length === 0;
  const disabled = submitting || terminal;

  function changeDraft(changes: Partial<TaskDraft>): void {
    setDraft((current) => ({ ...current, ...changes }));
    setSubmissionFailed(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (disabled || unchanged || submitBlocked) return;
    setShowValidation(true);
    if (Object.keys(validation).length > 0) return;
    setSubmissionFailed(false);
    try {
      await onSubmit(update ?? buildCreateTaskInput(draft, parentUuid));
    } catch {
      setSubmissionFailed(true);
    }
  }

  return (
    <Stack
      component="form"
      noValidate
      aria-label={
        original === undefined ? t('actions.createTask') : t('actions.editTask')
      }
      aria-busy={submitting}
      onSubmit={(event: FormEvent<HTMLFormElement>) => void submit(event)}
      spacing={3}
    >
      {terminal ? (
        <Alert severity="info">{t('form.terminalHelp')}</Alert>
      ) : null}
      {error !== null || submissionFailed ? (
        <Alert severity="error">{error ?? t('form.saveError')}</Alert>
      ) : null}
      {showValidation && Object.keys(validation).length > 0 ? (
        <Alert severity="error">{t('form.reviewFields')}</Alert>
      ) : null}
      <TextField
        id={`${id}-name`}
        label={t('form.name')}
        value={draft.name}
        onChange={(event) => changeDraft({ name: event.target.value })}
        required
        disabled={disabled}
        error={errors.name !== undefined}
        helperText={errors.name}
        autoFocus
        fullWidth
      />
      <Box>
        <TextField
          id={`${id}-description`}
          label={t('form.description')}
          value={draft.description ?? ''}
          onChange={(event) => changeDraft({ description: event.target.value })}
          disabled={disabled}
          multiline
          minRows={3}
          fullWidth
        />
        <Button
          size="small"
          onClick={() => changeDraft({ description: null })}
          disabled={disabled || draft.description === null}
          sx={{ mt: 0.5 }}
        >
          {t('form.removeDescription')}
        </Button>
      </Box>
      <TextField
        id={`${id}-priority`}
        label={t('form.priority')}
        select
        value={draft.priority}
        onChange={(event) => {
          const priority = Object.values(TaskPriority).find(
            (value) => String(value) === event.target.value,
          );
          if (priority !== undefined) changeDraft({ priority });
        }}
        disabled={disabled}
        fullWidth
      >
        {Object.values(TaskPriority).map((priority) => (
          <MenuItem key={priority} value={priority}>
            {taskPriorityLabels[priority]}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="body2" color="text.secondary">
        {t('form.datesHelp')}
      </Typography>
      <TaskDateFields
        kind="start"
        value={draft.start}
        onChange={(start) => changeDraft({ start })}
        disabled={disabled}
        error={errors.start}
      />
      <TaskDateFields
        kind="end"
        value={draft.end}
        onChange={(end) => changeDraft({ end })}
        disabled={disabled}
        error={errors.end}
      />
      <TaskDateFields
        kind="reminder"
        value={draft.reminder}
        onChange={(reminder) => changeDraft({ reminder })}
        disabled={disabled}
        error={errors.reminder}
        reminder
      />
      {original === undefined ? (
        <Typography variant="body2" color="text.secondary">
          {t('form.createHelp')}
        </Typography>
      ) : null}
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={submitting}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={disabled || unchanged || submitBlocked}
          loading={submitting}
        >
          {original === undefined
            ? t('actions.createTask')
            : t('actions.saveChanges')}
        </Button>
      </Stack>
    </Stack>
  );
}
