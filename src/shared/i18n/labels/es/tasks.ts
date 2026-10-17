import type { tasks as englishTasks } from '#src/shared/i18n/labels/en/tasks.js';

export const tasks = {
  actions: {
    addTask: 'Añadir tarea',
    createTask: 'Crear tarea',
    editTask: 'Editar tarea',
    deleteTask: 'Eliminar tarea',
    addSubtask: 'Añadir subtarea',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    back: 'Volver',
    backToList: 'Volver a la lista',
    saving: 'Guardando…',
    retry: 'Reintentar',
    reload: 'Recargar',
  },
  views: {
    label: 'Vistas de tareas',
    all: 'Todas',
    overdue: 'Vencidas',
    today: 'Hoy',
    upcoming: 'Próximos 7 días',
    closed: 'Completadas y canceladas',
  },
  filters: {
    title: 'Buscar, filtrar y ordenar +',
    search: 'Buscar tareas',
    searchHelp: 'Busca en el nombre o la descripción.',
    statuses: 'Estados',
    dateField: 'Fecha por',
    noDateFilter: 'Sin filtro de fecha',
    dateFrom: 'Desde el día',
    dateTo: 'Hasta el día',
    inclusiveDay: 'Día incluido · Madrid',
    invalidDateRange: 'El último día no puede ser anterior al primero.',
    sortBy: 'Ordenar por',
    createdAt: 'Creación',
    sortDirection: 'Sentido',
    ascending: 'Ascendente',
    descending: 'Descendente',
    apply: 'Aplicar filtros',
    clear: 'Limpiar filtros',
  },
  labels: {
    status: {
      PENDING: 'Pendiente',
      SCHEDULED: 'Programada',
      IN_PROGRESS: 'En curso',
      PAUSED: 'Pausada',
      BLOCKED: 'Bloqueada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    },
    priority: {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
    },
    priorityWithValue: 'Prioridad {{priority}}',
  },
  form: {
    name: 'Nombre',
    description: 'Descripción',
    removeDescription: 'Quitar descripción',
    priority: 'Prioridad',
    optional: 'Opcional',
    optionalMadridTime: 'Opcional · hora de Madrid',
    reminderHelp:
      'Sin hora indicada: aviso a las 06:00 de Madrid. Se dirige al correo de Google del propietario y se enviará si el servidor lo tiene habilitado y configurado. Completar, cancelar, eliminar o quitar el recordatorio anula los avisos pendientes; un correo cuyo envío ya está en curso no se puede retirar.',
    datesHelp:
      'Todas las fechas y horas se interpretan en Europe/Madrid. La hora es opcional; 00:00 significa medianoche explícita. Puedes guardar solo un día. Una hora inexistente por el cambio de horario será rechazada por el servidor para que puedas corregirla.',
    createHelp:
      'La tarea se creará como pendiente. Después podrás programarla desde su detalle.',
    terminalHelp:
      'Las tareas completadas o canceladas se consultan en modo lectura. Sus fechas y recordatorio son datos guardados; no representan avisos activos.',
    saveError: 'No se pudo guardar la tarea. Inténtalo de nuevo.',
    reviewFields: 'Revisa los campos indicados antes de guardar.',
  },
  dates: {
    none: 'Sin fecha',
    start: {
      label: 'Inicio',
      day: 'Día de inicio',
      time: 'Hora de inicio',
      remove: 'Quitar inicio',
      removeTime: 'Quitar hora de inicio',
    },
    end: {
      label: 'Fin',
      day: 'Día de fin',
      time: 'Hora de fin',
      remove: 'Quitar fin',
      removeTime: 'Quitar hora de fin',
    },
    reminder: {
      label: 'Recordatorio',
      day: 'Día de recordatorio',
      time: 'Hora de recordatorio',
      remove: 'Quitar recordatorio',
      removeTime: 'Quitar hora de recordatorio',
    },
  },
  list: {
    label: 'Tareas',
    noMatches: 'No hay coincidencias',
    emptyTitle: 'Un poco de espacio para organizarte',
    noMatchesHelp: 'Prueba con otra búsqueda o limpia los filtros.',
    emptyHelp:
      'Añade tu primera tarea y deja que LiLi te ayude a tenerla presente.',
    subtaskHelp: 'Subtarea · ver principal en el detalle',
    start: 'Inicio: {{date}}',
    end: 'Fin: {{date}}',
    reminder: 'Recordatorio: {{date}}',
  },
  page: {
    title: 'Tus tareas',
    description: 'Lo que tienes entre manos, a tu ritmo.',
    count_one: '{{count}} tarea',
    count_other: '{{count}} tareas',
    filteredCount_one: '{{count}} tarea en esta consulta',
    filteredCount_other: '{{count}} tareas en esta consulta',
    loading: 'Cargando tareas…',
    loadingLabel: 'Cargando tareas',
    queryError: 'No se pudo cargar la consulta',
    savedRefreshError:
      'La operación se guardó, pero no se pudo actualizar la lista. No hace falta repetirla.',
  },
  detail: {
    title: 'Detalle de tarea',
    loading: 'Cargando detalle y subtareas…',
    savedRefreshError:
      'La operación se guardó, pero no se pudo actualizar el detalle. No la repitas.',
    unavailable: 'La tarea ya no está disponible. Vuelve a la lista o recarga.',
    viewParent: 'Ver principal',
    viewNamedParent: 'Ver principal: {{name}}',
    noDescription: 'Sin descripción',
    emptyDescription: 'Descripción vacía',
    timezoneHelp: 'Todas las horas se interpretan en Madrid (Europe/Madrid).',
    reminderRecipient: 'Recordatorio guardado para {{email}}.',
    reminderWithoutTime: 'Sin hora, se programa a las 06:00 de Madrid.',
    reminderDeliveryHelp:
      'La fecha guardada no confirma el envío ni la recepción del correo.',
    terminalReminder:
      'Esta tarea está cerrada y su recordatorio es de solo lectura.',
    readOnly: 'Esta tarea es de solo lectura. Puedes consultarla o eliminarla.',
    status: 'Estado',
    statusHelp:
      'Los estados se cambian manualmente; las fechas no los cambian.',
    statusConditions: 'Condiciones del cambio de estado',
    addStart: 'Añadir inicio para programar',
    cancelSubtasksHelp:
      'Al cancelar esta tarea se cancelarán también sus subtareas, tras confirmar la operación.',
    subtasksCount_one: 'Subtarea ({{count}})',
    subtasksCount_other: 'Subtareas ({{count}})',
    subtasks: 'Subtareas',
    noSubtasks: 'Todavía no hay subtareas.',
    subtaskSummary: '{{status}} · Prioridad {{priority}}',
  },
  confirmation: {
    cancelTitle: 'Cancelar tarea',
    delete: 'Eliminar',
    cancelConfirm: 'Cancelar tarea y subtareas',
    deleteDescription: 'Se eliminará «{{name}}».',
    deleteSubtasks: 'También se eliminarán todas sus subtareas.',
    irreversible: 'Esta acción no se puede deshacer.',
    cancelDescription:
      'Se cancelará «{{name}}» y todas sus subtareas visibles. Si alguna está completada, la operación se rechazará.',
    reminders:
      'Los avisos pendientes se anularán; un correo en curso no puede retirarse.',
  },
  editor: {
    checkBeforeSaving:
      'Comprueba si tu tarea está en la lista antes de volver a guardar.',
    checking: 'Comprobando…',
    checkList: 'Comprobar lista',
    checked:
      'Lista comprobada. Si ya está creada, ábrela; si no está, puedes volver a guardar.',
  },
  statusReasons: {
    terminal: 'Las tareas completadas y canceladas son de solo lectura.',
    startRequired:
      'Para programar la tarea, añade primero una fecha de inicio.',
    parentUnavailable:
      'No se ha podido cargar la principal. Recarga antes de cambiar el estado.',
    parentIncompatible:
      'El estado {{status}} no es compatible con la principal {{parentStatus}}.',
    completedSubtasks:
      'No se puede cancelar una tarea que tiene subtareas completadas.',
    finishSubtasks:
      'Para completar la tarea, completa o cancela todas sus subtareas.',
    subtasksIncompatible:
      'Hay subtareas incompatibles con el estado {{status}}. Revisa sus estados primero.',
  },
  feedback: {
    validation: {
      dayBeforeTime: 'Indica un día antes de añadir la hora.',
      invalidDate: 'Indica una fecha válida.',
      invalidTime: 'Indica una hora válida con horas y minutos.',
      nameRequired: 'Escribe un nombre para la tarea.',
      scheduledStart: 'Una tarea programada necesita un día de inicio.',
      endBeforeStart: 'El fin no puede ser anterior al inicio.',
    },
    errors: {
      uncertainCreation:
        'No se ha recibido una confirmación. La tarea podría haberse creado. Comprueba la lista antes de intentarlo otra vez.',
    },
    notices: {
      created: 'Tarea creada.',
      saved: 'Cambios guardados.',
      reminderSaved: 'Recordatorio guardado.',
      filtered:
        'La consulta actual puede excluir esta tarea; puedes verla en el detalle.',
      statusUpdated:
        'Estado actualizado. Los avisos pendientes se anulan al completar o cancelar.',
      deleted: 'Tarea eliminada. Sus avisos pendientes se han anulado.',
    },
  },
} satisfies typeof englishTasks;
