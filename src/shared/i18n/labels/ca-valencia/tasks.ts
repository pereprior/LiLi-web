import type { tasks as englishTasks } from '#src/shared/i18n/labels/en/tasks.js';

export const tasks = {
  actions: {
    addTask: 'Afegir tasca',
    createTask: 'Crear tasca',
    editTask: 'Editar tasca',
    deleteTask: 'Eliminar tasca',
    addSubtask: 'Afegir subtasca',
    cancel: 'Cancel·lar',
    saveChanges: 'Guardar els canvis',
    back: 'Tornar',
    backToList: 'Tornar a la llista',
    saving: 'Guardant…',
    retry: 'Tornar a intentar-ho',
    reload: 'Recarregar',
  },
  views: {
    label: 'Vistes de tasques',
    all: 'Totes',
    overdue: 'Vençudes',
    today: 'Hui',
    upcoming: 'Pròxims 7 dies',
    closed: 'Completades i cancel·lades',
  },
  filters: {
    title: 'Buscar, filtrar i ordenar +',
    search: 'Buscar tasques',
    searchHelp: 'Busca en el nom o la descripció.',
    statuses: 'Estats',
    dateField: 'Data per',
    noDateFilter: 'Sense filtre de data',
    dateFrom: 'Des del dia',
    dateTo: 'Fins al dia',
    inclusiveDay: 'Dia inclòs · Madrid',
    invalidDateRange: "L'últim dia no pot ser anterior al primer.",
    sortBy: 'Ordenar per',
    createdAt: 'Creació',
    sortDirection: 'Sentit',
    ascending: 'Ascendent',
    descending: 'Descendent',
    apply: 'Aplicar filtres',
    clear: 'Netejar filtres',
  },
  labels: {
    status: {
      PENDING: 'Pendent',
      SCHEDULED: 'Programada',
      IN_PROGRESS: 'En curs',
      PAUSED: 'Pausada',
      BLOCKED: 'Bloquejada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancel·lada',
    },
    priority: {
      LOW: 'Baixa',
      MEDIUM: 'Mitjana',
      HIGH: 'Alta',
    },
    priorityWithValue: 'Prioritat {{priority}}',
  },
  form: {
    name: 'Nom',
    description: 'Descripció',
    removeDescription: 'Llevar la descripció',
    priority: 'Prioritat',
    optional: 'Opcional',
    optionalMadridTime: 'Opcional · hora de Madrid',
    reminderHelp:
      "Sense hora indicada: avís a les 06:00 de Madrid. S'envia al correu de Google del propietari si el servidor ho té habilitat i configurat. Completar, cancel·lar, eliminar o llevar el recordatori anul·la els avisos pendents; un correu que ja s'està enviant no es pot retirar.",
    datesHelp:
      "Totes les dates i hores s'interpreten en Europe/Madrid. L'hora és opcional; 00:00 significa mitjanit explícita. Pots guardar només un dia. El servidor rebutjarà una hora inexistent pel canvi d'horari perquè pugues corregir-la.",
    createHelp:
      'La tasca es crearà com a pendent. Després podràs programar-la des del detall.',
    terminalHelp:
      'Les tasques completades o cancel·lades són de només lectura. Les seues dates i el recordatori són dades guardades; no representen avisos actius.',
    saveError: "No s'ha pogut guardar la tasca. Torna a intentar-ho.",
    reviewFields: 'Revisa els camps indicats abans de guardar.',
  },
  dates: {
    none: 'Sense data',
    start: {
      label: 'Inici',
      day: "Dia d'inici",
      time: "Hora d'inici",
      remove: "Llevar l'inici",
      removeTime: "Llevar l'hora d'inici",
    },
    end: {
      label: 'Fi',
      day: 'Dia de fi',
      time: 'Hora de fi',
      remove: 'Llevar la fi',
      removeTime: "Llevar l'hora de fi",
    },
    reminder: {
      label: 'Recordatori',
      day: 'Dia del recordatori',
      time: 'Hora del recordatori',
      remove: 'Llevar el recordatori',
      removeTime: "Llevar l'hora del recordatori",
    },
  },
  list: {
    label: 'Tasques',
    noMatches: 'No hi ha coincidències',
    emptyTitle: "Un poc d'espai per a organitzar-te",
    noMatchesHelp: 'Prova una altra busca o neteja els filtres.',
    emptyHelp:
      "Afig la teua primera tasca i deixa que LiLi t'ajude a tindre-la present.",
    subtaskHelp: 'Subtasca · vore la principal en el detall',
    start: 'Inici: {{date}}',
    end: 'Fi: {{date}}',
    reminder: 'Recordatori: {{date}}',
  },
  page: {
    title: 'Les teues tasques',
    description: 'El que tens entre mans, al teu ritme.',
    count_one: '{{count}} tasca',
    count_other: '{{count}} tasques',
    filteredCount_one: '{{count}} tasca en esta consulta',
    filteredCount_other: '{{count}} tasques en esta consulta',
    loading: 'Carregant tasques…',
    loadingLabel: 'Carregant tasques',
    queryError: "No s'ha pogut carregar la consulta",
    savedRefreshError:
      "L'operació s'ha guardat, però no s'ha pogut actualitzar la llista. No cal repetir-la.",
  },
  detail: {
    title: 'Detall de la tasca',
    loading: 'Carregant el detall i les subtasques…',
    savedRefreshError:
      "L'operació s'ha guardat, però no s'ha pogut actualitzar el detall. No la repetisques.",
    unavailable:
      'La tasca ja no està disponible. Torna a la llista o recarrega.',
    viewParent: 'Vore la principal',
    viewNamedParent: 'Vore la principal: {{name}}',
    noDescription: 'Sense descripció',
    emptyDescription: 'Descripció buida',
    timezoneHelp: "Totes les hores s'interpreten en Madrid (Europe/Madrid).",
    reminderRecipient: 'Recordatori guardat per a {{email}}.',
    reminderWithoutTime: 'Sense hora, es programa a les 06:00 de Madrid.',
    reminderDeliveryHelp:
      "La data guardada no confirma l'enviament ni la recepció del correu.",
    terminalReminder:
      'Esta tasca està tancada i el seu recordatori és de només lectura.',
    readOnly:
      'Esta tasca és de només lectura. Pots consultar-la o eliminar-la.',
    status: 'Estat',
    statusHelp: 'Els estats es canvien manualment; les dates no els canvien.',
    statusConditions: "Condicions del canvi d'estat",
    addStart: 'Afegir un inici per a programar',
    cancelSubtasksHelp:
      "En cancel·lar esta tasca també es cancel·laran les seues subtasques, després de confirmar l'operació.",
    subtasksCount_one: 'Subtasca ({{count}})',
    subtasksCount_other: 'Subtasques ({{count}})',
    subtasks: 'Subtasques',
    noSubtasks: 'Encara no hi ha subtasques.',
    subtaskSummary: '{{status}} · Prioritat {{priority}}',
  },
  confirmation: {
    cancelTitle: 'Cancel·lar la tasca',
    delete: 'Eliminar',
    cancelConfirm: 'Cancel·lar la tasca i les subtasques',
    deleteDescription: "S'eliminarà «{{name}}».",
    deleteSubtasks: "També s'eliminaran totes les seues subtasques.",
    irreversible: 'Esta acció no es pot desfer.',
    cancelDescription:
      "Es cancel·larà «{{name}}» i totes les seues subtasques visibles. Si alguna està completada, es rebutjarà l'operació.",
    reminders:
      "Els avisos pendents s'anul·laran; un correu que ja s'està enviant no es pot retirar.",
  },
  editor: {
    checkBeforeSaving:
      'Comprova si la teua tasca està en la llista abans de tornar a guardar.',
    checking: 'Comprovant…',
    checkList: 'Comprovar la llista',
    checked:
      'Llista comprovada. Si ja està creada, obri-la; si no està, pots tornar a guardar.',
  },
  statusReasons: {
    terminal: 'Les tasques completades i cancel·lades són de només lectura.',
    startRequired: "Per a programar la tasca, afig primer una data d'inici.",
    parentUnavailable:
      "No s'ha pogut carregar la principal. Recarrega abans de canviar l'estat.",
    parentIncompatible:
      "L'estat {{status}} no és compatible amb la principal {{parentStatus}}.",
    completedSubtasks:
      'No es pot cancel·lar una tasca que té subtasques completades.',
    finishSubtasks:
      'Per a completar la tasca, completa o cancel·la totes les seues subtasques.',
    subtasksIncompatible:
      "Hi ha subtasques incompatibles amb l'estat {{status}}. Revisa primer els seus estats.",
  },
  feedback: {
    validation: {
      dayBeforeTime: 'Indica un dia abans d’afegir l’hora.',
      invalidDate: 'Indica una data vàlida.',
      invalidTime: 'Indica una hora vàlida amb hores i minuts.',
      nameRequired: 'Escriu un nom per a la tasca.',
      scheduledStart: 'Una tasca programada necessita un dia d’inici.',
      endBeforeStart: 'La fi no pot ser anterior a l’inici.',
    },
    errors: {
      uncertainCreation:
        'No s’ha rebut cap confirmació. La tasca podria haver-se creat. Comprova la llista abans de tornar-ho a intentar.',
    },
    notices: {
      created: 'Tasca creada.',
      saved: 'Canvis guardats.',
      reminderSaved: 'Recordatori guardat.',
      filtered:
        'La consulta actual pot excloure esta tasca; pots vore-la en el detall.',
      statusUpdated:
        'Estat actualitzat. Els avisos pendents s’anul·len en completar o cancel·lar.',
      deleted: 'Tasca eliminada. Els seus avisos pendents s’han anul·lat.',
    },
  },
} satisfies typeof englishTasks;
