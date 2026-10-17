import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TaskConfirmationDialog } from '#src/tasks/components/confirmation/task-confirmation-dialog.js';
import { TaskDetail } from '#src/tasks/components/detail/task-detail.js';
import { TaskDetailDialog } from '#src/tasks/components/detail/task-detail-dialog.js';
import { TaskFilters as TaskFilterControls } from '#src/tasks/components/filters/task-filters.js';
import { TaskViews } from '#src/tasks/components/filters/task-views.js';
import { TaskEditorDialog } from '#src/tasks/components/form/task-editor-dialog.js';
import { TaskList } from '#src/tasks/components/list/task-list.js';
import { useTaskActions } from '#src/tasks/hooks/actions/use-task-actions.js';
import {
  useTaskContext,
  useTaskList,
} from '#src/tasks/hooks/data/use-task-data.js';
import { useTaskSelection } from '#src/tasks/hooks/selection/use-task-selection.js';
import type { TaskFilters } from '#src/tasks/types/task.types.js';

type TasksPageProps = { email: string; onUnauthorized: () => void };

export function TasksPage({
  email,
  onUnauthorized,
}: TasksPageProps): ReactElement {
  const { t } = useTranslation('tasks');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [reloadCount, setReloadCount] = useState(0);
  const { selectedUuid, selectTask } = useTaskSelection();
  const list = useTaskList(filters, reloadCount, onUnauthorized);
  const detail = useTaskContext(selectedUuid, reloadCount, onUnauthorized);
  const filtered = !!(
    filters.search?.trim() ||
    filters.status?.length ||
    filters.view ||
    filters.dateField ||
    filters.dateFrom ||
    filters.dateTo
  );

  function refresh(): void {
    setReloadCount((value) => value + 1);
  }

  const actions = useTaskActions({
    filtered,
    selectTask,
    refresh,
    onUnauthorized,
  });

  function closeDetail(): void {
    if (actions.busy) return;
    selectTask(null);
    actions.clearError();
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
      >
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 650 }}>
            {t('page.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('page.description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          disabled={actions.busy}
          onClick={() => actions.openEditor({ kind: 'create' })}
        >
          {t('actions.addTask')}
        </Button>
      </Stack>
      {actions.notice && (
        <Alert severity="success" onClose={actions.dismissNotice}>
          {actions.notice}
        </Alert>
      )}
      <TaskViews filters={filters} onChange={setFilters} />
      <TaskFilterControls
        key={JSON.stringify(filters)}
        filters={filters}
        onApply={setFilters}
      />
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="body2" color="text.secondary" role="status">
          {list.status === 'ready'
            ? t(filtered ? 'page.filteredCount' : 'page.count', {
                count: list.data.length,
              })
            : list.status === 'loading'
              ? t('page.loading')
              : t('page.queryError')}
        </Typography>
        <Button disabled={list.status === 'loading'} onClick={refresh}>
          {t('actions.reload')}
        </Button>
      </Stack>
      {list.status === 'loading' && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress aria-label={t('page.loadingLabel')} />
        </Box>
      )}
      {list.status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={refresh}>
              {t('actions.retry')}
            </Button>
          }
        >
          {actions.notice ? `${t('page.savedRefreshError')} ` : ''}
          {list.message}
        </Alert>
      )}
      {list.status === 'ready' && (
        <TaskList
          tasks={list.data}
          filtered={filtered}
          selectedUuid={selectedUuid}
          onSelect={selectTask}
          onClearFilters={() => setFilters({})}
          onCreate={() => actions.openEditor({ kind: 'create' })}
        />
      )}

      <TaskDetailDialog
        open={selectedUuid !== null}
        detail={detail}
        busy={actions.busy}
        error={
          actions.editor || actions.confirmation ? null : actions.mutationError
        }
        saved={actions.notice !== null}
        onClose={closeDetail}
        onReload={refresh}
      >
        {detail.status === 'ready' && (
          <TaskDetail
            key={detail.data.task.uuid}
            task={detail.data.task}
            family={detail.data.family}
            email={email}
            busy={actions.busy}
            onSelect={selectTask}
            onEdit={() =>
              actions.openEditor({ kind: 'edit', task: detail.data.task })
            }
            onCreateSubtask={() =>
              actions.openEditor({
                kind: 'create',
                parentUuid: detail.data.task.uuid,
              })
            }
            onChangeStatus={(status) =>
              actions.requestStatusChange(detail.data.task, status)
            }
            onDelete={() => actions.requestDelete(detail.data.task)}
          />
        )}
      </TaskDetailDialog>
      <TaskEditorDialog
        editor={actions.editor}
        busy={actions.busy}
        error={actions.mutationError}
        uncertainCreation={actions.uncertainCreation}
        onClose={actions.closeEditor}
        onSave={actions.save}
        onReviewCreation={actions.reviewCreation}
        onSelectExisting={actions.selectExistingTask}
      />
      <TaskConfirmationDialog
        confirmation={actions.confirmation}
        busy={actions.busy}
        error={actions.mutationError}
        onClose={actions.closeConfirmation}
        onConfirm={actions.confirmAction}
      />
    </Stack>
  );
}
