export const tasks = {
  actions: {
    addTask: 'Add task',
    createTask: 'Create task',
    editTask: 'Edit task',
    deleteTask: 'Delete task',
    addSubtask: 'Add subtask',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    back: 'Back',
    backToList: 'Back to the list',
    saving: 'Saving…',
    retry: 'Retry',
    reload: 'Reload',
  },
  views: {
    label: 'Task views',
    all: 'All',
    overdue: 'Overdue',
    today: 'Today',
    upcoming: 'Next 7 days',
    closed: 'Completed and cancelled',
  },
  filters: {
    title: 'Search, filter and sort +',
    search: 'Search tasks',
    searchHelp: 'Search the name or description.',
    statuses: 'Statuses',
    dateField: 'Date field',
    noDateFilter: 'No date filter',
    dateFrom: 'From day',
    dateTo: 'To day',
    inclusiveDay: 'Day included · Madrid',
    invalidDateRange: 'The last day cannot be before the first day.',
    sortBy: 'Sort by',
    createdAt: 'Created',
    sortDirection: 'Direction',
    ascending: 'Ascending',
    descending: 'Descending',
    apply: 'Apply filters',
    clear: 'Clear filters',
  },
  labels: {
    status: {
      PENDING: 'Pending',
      SCHEDULED: 'Scheduled',
      IN_PROGRESS: 'In progress',
      PAUSED: 'Paused',
      BLOCKED: 'Blocked',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    },
    priority: {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
    },
    priorityWithValue: 'Priority {{priority}}',
  },
  form: {
    name: 'Name',
    description: 'Description',
    removeDescription: 'Remove description',
    priority: 'Priority',
    optional: 'Optional',
    optionalMadridTime: 'Optional · Madrid time',
    reminderHelp:
      "Without a time: reminder at 06:00 Madrid time. It goes to the owner's Google email and will be sent if the server has delivery enabled and configured. Completing, cancelling or deleting the task, or removing the reminder, cancels pending notifications; an email already being sent cannot be recalled.",
    datesHelp:
      'All dates and times use Europe/Madrid. The time is optional; 00:00 explicitly means midnight. You can save a day without a time. The server will reject a time that does not exist because of a daylight saving change so you can correct it.',
    createHelp:
      'The task will be created as pending. You can schedule it later from its details.',
    terminalHelp:
      'Completed or cancelled tasks are read-only. Their dates and reminders are saved information; they do not represent active notifications.',
    saveError: 'The task could not be saved. Try again.',
    reviewFields: 'Check the highlighted fields before saving.',
  },
  dates: {
    none: 'No date',
    start: {
      label: 'Start',
      day: 'Start day',
      time: 'Start time',
      remove: 'Remove start',
      removeTime: 'Remove start time',
    },
    end: {
      label: 'End',
      day: 'End day',
      time: 'End time',
      remove: 'Remove end',
      removeTime: 'Remove end time',
    },
    reminder: {
      label: 'Reminder',
      day: 'Reminder day',
      time: 'Reminder time',
      remove: 'Remove reminder',
      removeTime: 'Remove reminder time',
    },
  },
  list: {
    label: 'Tasks',
    noMatches: 'No matches',
    emptyTitle: 'A little space to get organised',
    noMatchesHelp: 'Try another search or clear the filters.',
    emptyHelp: 'Add your first task and let LiLi help you keep it in mind.',
    subtaskHelp: 'Subtask · view parent in the details',
    start: 'Start: {{date}}',
    end: 'End: {{date}}',
    reminder: 'Reminder: {{date}}',
  },
  page: {
    title: 'Your tasks',
    description: 'What is on your plate, at your own pace.',
    count_one: '{{count}} task',
    count_other: '{{count}} tasks',
    filteredCount_one: '{{count}} task in this query',
    filteredCount_other: '{{count}} tasks in this query',
    loading: 'Loading tasks…',
    loadingLabel: 'Loading tasks',
    queryError: 'The query could not be loaded',
    savedRefreshError:
      'The operation was saved, but the list could not be refreshed. You do not need to repeat it.',
  },
  detail: {
    title: 'Task details',
    loading: 'Loading details and subtasks…',
    savedRefreshError:
      'The operation was saved, but the details could not be refreshed. Do not repeat it.',
    unavailable:
      'The task is no longer available. Return to the list or reload.',
    viewParent: 'View parent',
    viewNamedParent: 'View parent: {{name}}',
    noDescription: 'No description',
    emptyDescription: 'Empty description',
    timezoneHelp: 'All times use Madrid time (Europe/Madrid).',
    reminderRecipient: 'Reminder saved for {{email}}.',
    reminderWithoutTime:
      'Without a time, it is scheduled for 06:00 Madrid time.',
    reminderDeliveryHelp:
      'The saved date does not confirm that the email was sent or received.',
    terminalReminder: 'This task is closed and its reminder is read-only.',
    readOnly: 'This task is read-only. You can view or delete it.',
    status: 'Status',
    statusHelp: 'Statuses are changed manually; dates do not change them.',
    statusConditions: 'Status change conditions',
    addStart: 'Add a start date to schedule',
    cancelSubtasksHelp:
      'Cancelling this task will also cancel its subtasks after you confirm the operation.',
    subtasksCount_one: 'Subtask ({{count}})',
    subtasksCount_other: 'Subtasks ({{count}})',
    subtasks: 'Subtasks',
    noSubtasks: 'There are no subtasks yet.',
    subtaskSummary: '{{status}} · Priority {{priority}}',
  },
  confirmation: {
    cancelTitle: 'Cancel task',
    delete: 'Delete',
    cancelConfirm: 'Cancel task and subtasks',
    deleteDescription: '“{{name}}” will be deleted.',
    deleteSubtasks: 'All its subtasks will also be deleted.',
    irreversible: 'This action cannot be undone.',
    cancelDescription:
      '“{{name}}” and all its visible subtasks will be cancelled. If any are completed, the operation will be rejected.',
    reminders:
      'Pending notifications will be cancelled; an email already being sent cannot be recalled.',
  },
  editor: {
    checkBeforeSaving:
      'Check whether your task is in the list before saving again.',
    checking: 'Checking…',
    checkList: 'Check list',
    checked:
      'List checked. If it is already created, open it; if it is missing, you can save again.',
  },
  statusReasons: {
    terminal: 'Completed and cancelled tasks are read-only.',
    startRequired: 'To schedule the task, add a start date first.',
    parentUnavailable:
      'The parent could not be loaded. Reload before changing the status.',
    parentIncompatible:
      "The status {{status}} is not compatible with the parent's status {{parentStatus}}.",
    completedSubtasks: 'A task with completed subtasks cannot be cancelled.',
    finishSubtasks:
      'To complete the task, complete or cancel all its subtasks.',
    subtasksIncompatible:
      'Some subtasks are incompatible with the status {{status}}. Review their statuses first.',
  },
  feedback: {
    validation: {
      dayBeforeTime: 'Choose a day before adding a time.',
      invalidDate: 'Enter a valid date.',
      invalidTime: 'Enter a valid time with hours and minutes.',
      nameRequired: 'Enter a task name.',
      scheduledStart: 'A scheduled task needs a start day.',
      endBeforeStart: 'The end cannot be before the start.',
    },
    errors: {
      uncertainCreation:
        'No confirmation was received. The task may have been created. Check the list before trying again.',
    },
    notices: {
      created: 'Task created.',
      saved: 'Changes saved.',
      reminderSaved: 'Reminder saved.',
      filtered:
        'The current query may exclude this task; you can see it in the detail.',
      statusUpdated:
        'Status updated. Pending reminders are cancelled when completing or cancelling a task.',
      deleted: 'Task deleted. Its pending reminders have been cancelled.',
    },
  },
};
