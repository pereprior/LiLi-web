# LiLi Web · Plan de implementación del frontend

Revisión del 12 de octubre de 2026. Basada en el código actual de LiLi-api
`0.5.1` (`e60561f`) y en el estado de trabajo de LiLi-web, incluidos sus cambios
locales de Material UI, tema y documentación visual. Este documento es una guía
de trabajo: las funcionalidades descritas como pendientes todavía no están
implementadas en el frontend.

Actualización de implementación: los flujos del frontend de esta guía ya están
construidos. El [README](../README.md#verification) recoge las verificaciones
pendientes con Google, Gmail, navegación y el alojamiento de producción. El
contenido original de la guía se conserva como referencia de contratos y criterios
de aceptación.

El objetivo es poder usar desde la web todas las operaciones que el backend ya
ofrece: entrar con Google, consultar las tareas propias, organizarlas, crear y
editar tareas y subtareas, cambiar sus estados, eliminarlas y configurar sus
recordatorios por correo. Cada paso indica qué construir, qué contrato consumir
y cómo comprobar que está terminado.

## 1. Punto de partida y alcance

### Qué existe hoy

| Área                  | Backend actual                                                                              | Frontend actual                                                               | Trabajo pendiente en la web                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Base técnica          | NestJS, PostgreSQL, Prisma y validación HTTP                                                | React, TypeScript, Vite, Vitest y herramientas de calidad                     | Construir las funcionalidades sobre esta base                                                |
| Identidad visual      | No aplica                                                                                   | Material UI 9 con Emotion, tema claro/oscuro/sistema y selector de apariencia | Aplicar el tema a las pantallas; el archivo del logo y la tipografía final siguen pendientes |
| Conexión              | Rutas `/auth` y `/tasks`, protección por sesión y origen                                    | Proxy de ambas rutas en Vite, puerto 5173 fijo                                | Cliente HTTP y comprobación de la integración real                                           |
| Autenticación         | Google con lista de correos permitidos, sesión local de 7 días, consulta y cierre de sesión | Sin pantalla de acceso ni estado de sesión                                    | Acceso, recuperación de sesión, cuenta y logout                                              |
| Tareas                | Lista, detalle, creación, edición parcial y eliminación                                     | Sin pantallas ni llamadas                                                     | Lista, detalle y formularios                                                                 |
| Subtareas             | Un nivel, mismo propietario y reglas con la principal                                       | Sin funcionalidad                                                             | Relación visual y operaciones desde la principal                                             |
| Estados y prioridad   | Siete estados manuales; prioridades baja, media y alta                                      | Sin funcionalidad                                                             | Controles, ayudas y tratamiento de conflictos                                                |
| Organización          | Búsqueda, estados, rangos, ordenación y vistas rápidas                                      | Sin funcionalidad                                                             | Controles que construyan consultas válidas                                                   |
| Recordatorios         | Worker de Gmail, reintentos y seguimiento interno del envío                                 | Sin funcionalidad                                                             | Edición y visualización de la fecha, con mensajes ajustados al contrato                      |
| Acciones internas     | `LiliService.execute({ actor, action, payload })` ya implementado                           | No aplica                                                                     | Consumir las rutas HTTP existentes                                                           |
| Historial de acciones | Sin auditoría persistente consultable                                                       | Sin funcionalidad                                                             | No hay una API de auditoría que integrar                                                     |

El proxy de `/tasks` y la redirección tras el login **ya están resueltos**: el
callback devuelve al navegador a `/` de `APP_ORIGIN`. No son tareas pendientes
de implementación.

Las tareas se limitan al usuario de la sesión. Aunque LiLi se use en familia,
la API actual no ofrece tareas compartidas, asignación a otra persona, roles,
registro público ni administración de usuarios desde la web. Tampoco ofrece
reapertura de tareas terminales, restauración de eliminadas, paginación, cambios
de principal, notificaciones push ni consulta del estado de entrega del correo.

Fuentes: [composición de la API](../../LiLi-api/src/app.module.ts),
[controlador de tareas](../../LiLi-api/src/tasks/tasks.controller.ts),
[controlador de autenticación](../../LiLi-api/src/auth/auth.controller.ts),
[README del frontend](../README.md), [proxy y Vitest](../vite.config.ts),
[tema actual](../src/app/theme.ts) e [identidad visual](./identidad-visual.md).

### Contrato HTTP que hay que cubrir

Todas las rutas de tareas y `/auth/me` requieren la cookie de sesión. Las
escrituras, incluido logout, también validan `Origin` o `Referer`.

| Operación         | Petición                                    | Respuesta correcta                | Uso en la interfaz                                                |
| ----------------- | ------------------------------------------- | --------------------------------- | ----------------------------------------------------------------- |
| Iniciar acceso    | Navegación a `GET /auth/google`             | `302` hacia Google                | Botón «Entrar con Google»                                         |
| Completar acceso  | Google vuelve a `GET /auth/google/callback` | `302` a `/`, con cookie de sesión | La API procesa el callback; la web recupera la sesión al arrancar |
| Recuperar usuario | `GET /auth/me`                              | `200`, `{ uuid, email }`          | Arranque y cuenta actual                                          |
| Cerrar sesión     | `POST /auth/logout`                         | `204`, sin cuerpo                 | «Cerrar sesión»                                                   |
| Listar            | `GET /tasks` con filtros opcionales         | `200`, array plano de tareas      | Lista y vistas                                                    |
| Consultar         | `GET /tasks/{uuid}`                         | `200`, tarea                      | Detalle actualizado                                               |
| Crear             | `POST /tasks`                               | `201`, tarea en `PENDING`         | Crear principal o subtarea                                        |
| Editar detalles   | `PATCH /tasks/{uuid}`                       | `200`, tarea actualizada          | Formulario de edición                                             |
| Cambiar estado    | `PATCH /tasks/{uuid}/status`                | `200`, tarea actualizada          | Acciones de estado                                                |
| Eliminar          | `DELETE /tasks/{uuid}`                      | `200`, `{ "success": true }`      | Confirmación de eliminación                                       |

Las respuestas de tareas contienen directamente la tarea o el array. El
envoltorio interno `{ action, result }` de `LiliService` no se expone por HTTP;
tampoco existe un endpoint público `/actions` o `/reminders`.

Fuentes: [OpenAPI](../../LiLi-api/src/docs/openapi.yaml),
[rutas de autenticación](../../LiLi-api/src/auth/auth.controller.ts) y
[rutas de tareas](../../LiLi-api/src/tasks/tasks.controller.ts).

## 2. Orden de implementación

Completar los pasos en este orden permite comprobar cada incorporación sobre un
flujo que ya funciona. Los criterios de aceptación deben verificarse durante
cada paso; la revisión final reúne los recorridos completos.

### Paso 1 · Comprobar la conexión local

1. Mantener las peticiones del navegador en URLs relativas: `/auth/...` y
   `/tasks/...`. Vite ya las dirige a `API_TARGET`, por defecto
   `http://localhost:3000`, conservando las rutas y el origen del navegador.
2. Comprobar que la API usa `APP_ORIGIN=http://localhost:5173` y que Google tiene
   registrado `http://localhost:5173/auth/google/callback`. La API deriva el
   callback de `APP_ORIGIN`; no hay que calcularlo en el frontend.
3. Seguir el [arranque del backend](../../LiLi-api/README.md): base de datos,
   migraciones, generación de Prisma y `pnpm dev`. Iniciar también `pnpm dev`
   en LiLi-web.
4. Recordar que la configuración actual de la API exige usuario y contraseña
   de aplicación de Gmail incluso con `REMINDERS_ENABLED=false`. Es
   configuración del servidor; no debe pasar a variables `VITE_*`.
5. Comprobar en el navegador que `/auth/me` llega a la API y devuelve `401`
   cuando no hay sesión. Después, recorrer `/auth/google` y comprobar que un
   acceso válido vuelve al frontend en `/`.

**Terminado cuando:** ambos prefijos llegan a la API, el callback vuelve al
puerto 5173 y una escritura autenticada conserva el origen permitido. No hace
falta modificar el proxy ni la redirección para comenzar las pantallas.

Fuentes: [Vite](../vite.config.ts),
[configuración de autenticación](../../LiLi-api/src/auth/config/auth.config.ts),
[guard de origen](../../LiLi-api/src/auth/guards/origin.guard.ts) y
[configuración de Gmail](../../LiLi-api/src/reminders/config/reminders.config.ts).

### Paso 2 · Definir los contratos y el cliente HTTP

1. Crear contratos TypeScript del frontend para usuario, tareas, entrada de
   creación, edición, cambio de estado, filtros y errores. Mantenerlos dentro
   de la funcionalidad que los usa; no importar código NestJS o Prisma.
2. Representar los siete estados y las tres prioridades con enums del
   frontend y etiquetas españolas separadas de sus valores HTTP.
3. Crear un cliente HTTP pequeño compartido por autenticación y tareas. Debe
   conservar las cookies de las peticiones al mismo origen; se puede explicitar
   `credentials: 'same-origin'`. Enviar JSON en las escrituras que tienen cuerpo.
4. Comprobar el código HTTP antes de interpretar el resultado. Logout devuelve
   `204` y no permite llamar a `response.json()` de forma incondicional.
   Una respuesta vacía, HTML del proxy o JSON inesperado también debe acabar en
   un error legible.
5. Aceptar errores con `statusCode`, `message: string | string[]` y `error`
   opcional. Mantener el código HTTP para que cada pantalla decida cómo actuar.
   El backend no devuelve un mapa estructurado de errores por campo.
6. Permitir cancelar lecturas o ignorar respuestas antiguas. Cambiar un filtro
   o un detalle no debe permitir que una petición anterior sobrescriba la nueva.
7. No reintentar escrituras automáticamente. Deshabilitar el envío mientras
   está en curso; si se pierde la respuesta de una creación, comprobar la lista
   antes de repetirla para no crear duplicados.
8. Separar el resultado de guardar del resultado de recargar. Si la escritura
   tuvo éxito y falla la lectura posterior, confirmar el guardado e informar
   de que no se pudo actualizar la vista; no invitar a repetir la escritura.

La respuesta pública de una tarea tiene exactamente estos campos:

```ts
type TaskDate = { date: string; time: string | null };

type Task = {
  uuid: string;
  userUuid: string;
  parentUuid: string | null;
  name: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start: TaskDate | null;
  end: TaskDate | null;
  reminder: TaskDate | null;
};
```

No contiene `createdAt`, `updatedAt`, `deletedAt`, subtareas anidadas ni estado
del envío. Se puede pedir orden por creación, pero no mostrar una fecha de
creación que la API no entrega.

| Resultado                  | Comportamiento previsto                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `400`                      | Mantener el formulario o filtro y mostrar el motivo; corregir la entrada                                           |
| `401`                      | Invalidar la sesión local, retirar datos privados y mostrar acceso                                                 |
| `403` en escritura         | Explicar que la operación se ha rechazado; comprobar configuración de origen, sin asumir que la sesión ha caducado |
| `404` de tarea o principal | Mostrar «La tarea ya no está disponible» y ofrecer volver o recargar                                               |
| `409`                      | Explicar el conflicto, refrescar tarea y familia y permitir revisar el intento; conservar el borrador si lo hay    |
| `500`/`503` o fallo de red | Mostrar indisponibilidad y permitir reintentar de forma explícita                                                  |

**Terminado cuando:** las llamadas devuelven datos tipados, `204` se maneja sin
error, `message` admite arrays y los estados HTTP llegan a la pantalla adecuada.

Fuentes: [respuesta de tarea](../../LiLi-api/src/tasks/responses/task.response.ts),
[DTOs](../../LiLi-api/src/tasks/dto/create-task.dto.ts),
[esquema de error](../../LiLi-api/src/docs/components/schemas/http-error.yaml) y
[validación global](../../LiLi-api/src/config/app.config.ts).

### Paso 3 · Implementar acceso y estado de sesión

1. Al arrancar, consultar `GET /auth/me` y representar cuatro situaciones:
   comprobando sesión, autenticado, sin sesión y error de conexión. Durante la
   comprobación no mostrar brevemente el formulario de acceso o datos anteriores.
2. Con `200`, guardar en memoria `{ uuid, email }` y abrir el espacio de tareas.
   Con `401`, mostrar «Entrar con Google». Con error de red o servidor, mostrar
   el error y una acción para volver a comprobar.
3. El botón de acceso navega a `/auth/google` como página completa, por ejemplo
   mediante un enlace. No usar `fetch` para seguir el flujo OAuth ni instalar
   un SDK de Google en el navegador.
4. Tras el callback correcto, la aplicación arranca de nuevo en `/` y repite
   `/auth/me`. La sesión reside en una cookie HttpOnly; no hay token que leer o
   almacenar en `localStorage`.
5. Mostrar el correo del usuario y «Cerrar sesión». Ejecutar
   `POST /auth/logout`; con `204`, vaciar usuario, tareas, detalle y borradores
   privados y volver a acceso. Un `401` en logout también permite pasar al
   estado sin sesión; con fallo de red o `403`, informar del fallo sin presentar
   el cierre como confirmado.
6. Aplicar el mismo tratamiento a un `401` recibido durante cualquier operación:
   la sesión puede caducar, revocarse o dejar de estar permitida. El backend no
   ofrece refresh token ni un endpoint de renovación. Cancelar o descartar
   también las lecturas pendientes al invalidar o cerrar la sesión para que
   sus respuestas no vuelvan a introducir datos privados en la pantalla.

**Límite actual del acceso:** los errores del callback, como cuenta no permitida
o intento inválido, se responden en la ruta del backend. No se redirigen a una
pantalla SPA con `?error=...`. El frontend puede explicar el acceso restringido
antes de salir hacia Google, pero una pantalla propia de error tras el callback
requeriría acordar un cambio del backend. No bloquear el flujo correcto por esa
mejora.

**Terminado cuando:** acceso, retorno, recarga con sesión, caducidad y logout
funcionan en el navegador sin exponer credenciales. El usuario ve un error de
conexión distinto de la ausencia de sesión.

Fuentes: [AuthController](../../LiLi-api/src/auth/auth.controller.ts),
[validación de sesión](../../LiLi-api/src/auth/sessions/services/validate-session/validate-session.service.ts)
y [callback documentado](../../LiLi-api/src/docs/paths/auth/google-callback.yaml).

### Paso 4 · Organizar las pantallas y la navegación

1. Mantener `src/app/` como composición de sesión, navegación y espacio de
   trabajo. Crear `src/auth/` para acceso y sesión, y `src/tasks/` para contratos,
   llamadas, lista, detalle, formularios y controles de tareas.
2. Introducir código compartido solo para responsabilidades realmente comunes,
   como el cliente HTTP. Los recordatorios son un campo de las tareas en la API;
   por ahora no necesitan un módulo frontend independiente.
3. Propuesta inicial: mantener la aplicación en `/`, con lista y detalle en un
   panel o diálogo. Usar `/?task=<uuid>` si se quiere poder compartir y recargar
   la selección, gestionando también atrás/adelante. Esto permite empezar sin
   añadir una librería de rutas. Si se adoptan rutas de pantalla más adelante,
   acordarlas y evitar `/tasks`, reservado al proxy de la API.
4. Usar los componentes Material UI y el tema existentes, importando los
   componentes de forma directa como hace la página actual. Conservar el
   selector claro/oscuro/sistema y sus claves de persistencia.
5. Empezar con estado local y una única fuente de sesión. Ejecutar las
   escrituras en los eventos de usuario; usar efectos para sincronizar lecturas
   con selección y filtros, con limpieza. Derivar listas de subtareas y
   etiquetas de los datos actuales, sin mantener copias que puedan divergir.
6. Preparar una cabecera con usuario, apariencia y logout; debajo, navegación
   entre vistas, lista y «Añadir tarea». En móvil, el detalle debe poder ocupar
   la pantalla y volver a la lista sin perder sus filtros.

No hace falta instalar ahora un router, gestor global de estado, librería de
consultas, formularios, iconos o selectores de fecha. Si la implementación
justifica una dependencia adicional, decidirla por separado antes de instalarla.
El logo y la fuente pendientes no impiden completar los flujos funcionales.

**Terminado cuando:** la estructura separa responsabilidades por funcionalidad,
la navegación funciona al recargar y volver atrás, y la base visual se conserva.

Fuentes: [instrucciones del frontend](../AGENTS.md),
[App actual](../src/app/app.tsx), [montaje y tema](../src/main.tsx) y
[guía React instalada](../.agents/skills/vercel-react-best-practices/SKILL.md).

### Paso 5 · Construir lista y detalle de tareas

1. Después de recuperar la sesión, consultar `GET /tasks`. Sin filtros devuelve
   todas las tareas visibles propias, incluidas completadas y canceladas,
   ordenadas por creación ascendente y UUID como desempate.
2. Mostrar nombre, estado, prioridad y las fechas que existan. Para las
   subtareas, indicar su relación con la principal. No ocultarlas simplemente
   por tener `parentUuid`.
3. Diferenciar carga inicial, lista vacía, ausencia de coincidencias con filtros
   y fallo de lectura. Añadir una acción explícita de recarga.
4. Al seleccionar una tarea, consultar `GET /tasks/{uuid}`. Mostrar descripción,
   inicio, fin, recordatorio y acciones disponibles. El detalle debe funcionar
   aunque la tarea no esté en el resultado de la lista filtrada.
5. Para agrupar, usar `parentUuid === null` para principales y el UUID de la
   principal para sus hijos. La respuesta es plana y no paginada; el detalle
   de una principal tampoco contiene una colección de hijos.
6. Guardar por separado el resultado de la consulta visible y los datos que se
   necesiten para mostrar la familia completa. Para cargar todos los hijos,
   consultar `/tasks` sin filtros y seleccionar localmente los de esa principal.
   No existe filtro HTTP `parentUuid` ni endpoint de subtareas.
7. Un resultado filtrado puede incluir una subtarea sin su principal. Mostrar
   ese resultado igualmente, con acceso a su principal; cargar el contexto al
   abrirlo. Las tareas cargadas como contexto no deben mezclarse con las
   coincidencias del filtro ni alterar su orden.
8. Una vez validada la sesión, cargar en paralelo las lecturas independientes
   de detalle y familia cuando ambas hagan falta. Evitar una petición por cada
   fila de la lista.

**Terminado cuando:** se ven todas las coincidencias, el detalle puede abrirse
directamente y una subtarea nunca desaparece porque su principal esté filtrada.
Un `404` ofrece una salida clara a la lista.

Fuentes: [servicio de listado](../../LiLi-api/src/tasks/services/find-all-tasks/find-all-tasks.service.ts),
[respuesta pública](../../LiLi-api/src/docs/components/schemas/tasks/task.yaml) y
[contrato de la lista](../../LiLi-api/src/docs/paths/tasks/tasks.yaml).

### Paso 6 · Implementar fechas y creación de tareas

1. Construir un formulario con nombre obligatorio, descripción opcional,
   prioridad e inicio, fin y recordatorio opcionales. La prioridad inicial de
   la interfaz puede ser media; si se omite en el cuerpo, el backend también
   asigna `MEDIUM`.
2. Para cada fecha, permitir ausencia, solo día o día con hora. Usar controles
   de fecha y hora sencillos; la hora es opcional y depende de que haya día.
   Mostrar que todas las horas se interpretan en Madrid.
3. Mantener día y hora como cadenas locales. La entrada admite `YYYY-MM-DD` o
   `YYYY-MM-DDTHH:mm`, mientras la salida utiliza `{ date, time }`. No usar
   `toISOString()`, sufijo `Z`, offset UTC ni segundos para construir el cuerpo.
4. Conservar la diferencia entre `time: null` y `time: '00:00'`. Vaciar la hora
   significa fecha sin hora; no sustituirla por medianoche ni por la hora de
   recordatorio por defecto.
5. Validar que el nombre tenga contenido tras recortar espacios, que las fechas
   sean reales y que el fin no preceda al inicio. En el mismo día solo se
   comparan horas si ambas existen. No imponer que recordatorio, inicio y fin
   sean obligatorios o dependan unos de otros; la API permite fechas pasadas.
6. Enviar solo los campos admitidos en `POST /tasks`; nunca `userUuid`, `uuid`
   o `status`. La tarea nueva siempre queda en `PENDING`, aunque tenga inicio.
   Si después se quiere programar, usar el cambio de estado del paso 9.
7. Con `201`, usar la respuesta del servidor, actualizar la consulta actual y
   abrir el detalle. Si la tarea no encaja con el filtro activo, explicar que
   se ha creado y permitir verla sin fingir que coincide con esa vista.
8. Con error, conservar el formulario y mostrar el motivo. Una hora inexistente
   por el cambio de horario de Madrid puede ser rechazada por el backend;
   permitir corregirla sin desplazarla automáticamente.

Ejemplo de creación de una principal:

```json
{
  "name": "Comprar comida",
  "description": "Revisar lo que queda en la despensa",
  "priority": "HIGH",
  "start": "2026-10-15",
  "end": "2026-10-16T18:30",
  "reminder": "2026-10-14T09:00"
}
```

**Terminado cuando:** crear con solo nombre funciona; las tres prioridades y
los tres modos de fecha se guardan y se leen sin cambios de día u hora. La
validación fallida mantiene los datos introducidos.

Fuentes: [CreateTaskDto](../../LiLi-api/src/tasks/dto/create-task.dto.ts),
[creación](../../LiLi-api/src/tasks/services/create-task/create-task.service.ts),
[formato de fecha](../../LiLi-api/src/docs/components/schemas/tasks/task-date-input.yaml)
y [validación de intervalos](../../LiLi-api/src/tasks/utils/task-date.utils.ts).

### Paso 7 · Implementar la edición parcial

1. Reutilizar el formulario cargándolo desde el detalle actual. Separar los
   datos del servidor del borrador del usuario.
2. Construir `PATCH /tasks/{uuid}` con los campos modificados. Un campo omitido
   conserva el valor; `null` elimina descripción, inicio, fin o recordatorio.
   Una cadena vacía es una descripción válida, pero no sirve para borrar una
   fecha. Nombre y prioridad no admiten `null`.
3. No enviar `parentUuid`, propietario o estado en esta operación. La API no
   permite mover una subtarea a otra principal o convertirla en principal.
4. Validar el intervalo resultante combinando las fechas nuevas con las que
   se mantienen. Una tarea `SCHEDULED` no puede quedarse sin inicio.
5. Deshabilitar guardar mientras se envía o cuando no hay cambios. Aunque el
   backend admite `{}`, no aporta una operación útil a la interfaz.
6. Al guardar, refrescar detalle y lista: un cambio puede alterar el orden o
   hacer que la tarea deje de coincidir con el filtro. No sobrescribir un
   borrador con una recarga que llegue mientras se está editando.
7. Mostrar completadas y canceladas en modo lectura. Sus detalles son
   inmutables, incluidos prioridad y recordatorio; la eliminación sigue
   disponible.

Ejemplo: cambiar prioridad y quitar el recordatorio conservando lo demás.

```json
{
  "priority": "LOW",
  "reminder": null
}
```

La respuesta no incluye versión ni `updatedAt`, y no hay contrato de `ETag` o
`If-Match`. Un `409` puede detectar conflictos durante una transacción; la web
no puede garantizar la detección de todo borrador antiguo entre pestañas. Tras
un conflicto, recargar y dejar que el usuario revise antes de volver a guardar.

**Terminado cuando:** editar un solo campo conserva los demás; borrar campos
opcionales envía `null`; los estados terminales no ofrecen edición y los
errores mantienen el borrador.

Fuentes: [UpdateTaskDetailsDto](../../LiLi-api/src/tasks/dto/update-task-details.dto.ts),
[servicio de edición](../../LiLi-api/src/tasks/services/update-task-details/update-task-details.service.ts)
y [transacciones del repositorio](../../LiLi-api/src/tasks/repositories/prisma-task.repository.ts).

### Paso 8 · Implementar las subtareas

1. En el detalle de una principal editable, mostrar sus subtareas completas y
   una acción «Añadir subtarea».
2. Reutilizar la creación enviando `parentUuid` con el UUID de la principal.
   Cada subtarea tiene su propia descripción, prioridad, fechas y recordatorio;
   no hereda la prioridad de su principal. Siempre empieza en `PENDING`.
3. Ocultar «Añadir subtarea» en una subtarea y en principales completadas o
   canceladas. Solo se permite un nivel, con una principal visible del mismo
   usuario. Si cambia antes de guardar, manejar el `404` o `409` del servidor.
4. Abrir, editar, cambiar estado y eliminar la subtarea con las mismas rutas
   `/tasks/{uuid}` que una principal. Añadir acceso de vuelta a su principal.
5. Mantener visibles los hijos terminales en el detalle familiar, aunque la
   lista principal esté filtrada por estados activos. Las reglas de completar
   y cancelar necesitan la familia completa, no solo sus coincidencias.
6. No limitar las fechas de una subtarea a las de su principal: el backend no
   exige esa relación. Tampoco cambia automáticamente el estado de la principal
   cuando se modifica un hijo.

**Terminado cuando:** se puede crear y gestionar un nivel de subtareas, cada
hijo conserva sus propios datos y los filtros no ocultan información necesaria
para operar sobre la familia.

Fuentes: [creación y comprobación de la principal](../../LiLi-api/src/tasks/services/create-task/create-task.service.ts)
y [reglas de ciclo de vida](../../LiLi-api/test/tasks/task-lifecycle.e2e-spec.ts).

### Paso 9 · Implementar los cambios de estado

1. Mostrar etiquetas españolas conservando estos valores HTTP:

   | Valor         | Etiqueta propuesta |
   | ------------- | ------------------ |
   | `PENDING`     | Pendiente          |
   | `SCHEDULED`   | Programada         |
   | `IN_PROGRESS` | En curso           |
   | `PAUSED`      | Pausada            |
   | `BLOCKED`     | Bloqueada          |
   | `COMPLETED`   | Completada         |
   | `CANCELLED`   | Cancelada          |

2. Enviar únicamente `{ "status": "IN_PROGRESS" }`, o el destino elegido, a
   `PATCH /tasks/{uuid}/status`. Los estados son manuales: llegar a una fecha
   no programa, inicia, completa ni cancela una tarea.
3. Para `SCHEDULED`, exigir que exista inicio. Ofrecer editarlo primero si
   falta. Guardar fecha y cambiar estado son dos peticiones; si la segunda
   falla, informar de que la fecha se guardó y el estado no cambió.
4. No inventar una secuencia obligatoria entre los estados no terminales. Los
   destinos se limitan por inicio, estado de la principal e hijos visibles:

   | Estado de la principal             | Estados compatibles de sus subtareas |
   | ---------------------------------- | ------------------------------------ |
   | `PENDING`                          | `PENDING`                            |
   | `SCHEDULED`                        | `PENDING`, `SCHEDULED`               |
   | `IN_PROGRESS`, `PAUSED`, `BLOCKED` | Cualquiera de los siete              |
   | `COMPLETED`                        | `COMPLETED`, `CANCELLED`             |
   | `CANCELLED`                        | `CANCELLED`                          |

5. Al completar una principal, explicar que todos los hijos visibles deben
   estar completados o cancelados. La operación no completa hijos automáticamente.
6. Al cancelar una principal, confirmar que también se cancelarán sus hijos
   visibles. Si alguno está completado, el backend rechaza toda la operación;
   no hay cambios parciales. Los hijos ya eliminados no bloquean estas reglas.
7. Al volver una principal a pendiente o programada, comprobar los hijos contra
   la tabla; manejar el rechazo del servidor si alguno es incompatible.
8. `COMPLETED` y `CANCELLED` son terminales: no ofrecer reapertura, edición o
   un cambio de estado distinto. Pedir el estado actual es inocuo incluso en
   terminales, pero no requiere un botón adicional.
9. Tras el éxito, refrescar tarea, principal, hijos y resultado filtrado según
   corresponda. La respuesta del cambio de una principal solo contiene esa
   tarea, aunque la cancelación haya modificado varios hijos.

Las restricciones de la interfaz ayudan al usuario; la API sigue siendo quien
valida la operación. No asumir que el estado cargado sigue vigente al pulsar.

**Terminado cuando:** programar sin inicio tiene una salida clara; completar y
cancelar respetan la familia; los conflictos refrescan el contexto y ningún
control promete reabrir una tarea terminal.

Fuentes: [reglas de estados](../../LiLi-api/src/tasks/utils/task-state-rules.utils.ts),
[actualización de estado](../../LiLi-api/src/tasks/services/update-task-status/update-task-status.service.ts)
y [contrato de la operación](../../LiLi-api/src/docs/components/schemas/tasks/update-task-status.yaml).

### Paso 10 · Implementar la eliminación

1. Mostrar «Eliminar» también en completadas y canceladas. Confirmar con el
   nombre de la tarea y, si es principal, explicar que afecta a sus subtareas.
   La confirmación no debe depender de cuántos hijos coinciden con un filtro.
2. Enviar `DELETE /tasks/{uuid}` y esperar `200` con `{ "success": true }`.
3. La API decide el tipo de borrado: en `PENDING` es físico y elimina los hijos
   por cascada; en cualquier otro estado es lógico y oculta también los hijos
   visibles. Eliminar una subtarea conserva su principal.
4. Tras el éxito, cerrar el detalle eliminado y recargar las listas y la familia
   afectadas. No dejar hijos de una principal eliminada en el estado local.
5. No ofrecer «Deshacer» o papelera: el backend no tiene restauración. Repetir
   la eliminación devuelve `404`; refrescar el contexto y explicar que el
   recurso ya no está disponible.

**Terminado cuando:** eliminar una principal retira sus hijos, eliminar un hijo
conserva la principal y el mensaje no promete una recuperación inexistente.

Fuentes: [servicio de eliminación](../../LiLi-api/src/tasks/services/delete-task/delete-task.service.ts),
[repositorio y cascadas](../../LiLi-api/src/tasks/repositories/prisma-task.repository.ts)
y [relaciones de persistencia](../../LiLi-api/prisma/models/tasks/task.prisma).

### Paso 11 · Añadir búsqueda, filtros, ordenación y vistas

1. Añadir búsqueda por texto, selección múltiple de estados, rango por inicio
   o fin y ordenación. Las consultas deben pedir el resultado al servidor;
   la web no debe reinterpretar sus criterios con la zona horaria del dispositivo.
2. Construir las URLs con `URLSearchParams`, repitiendo `status` por cada
   selección. Omitir campos vacíos; no enviar `status=`, `undefined`, `null`,
   estados separados por comas o parámetros no admitidos.
3. Mantener controles y consulta sincronizados. Para empezar, usar un envío
   explícito de filtros y búsqueda; si se añade búsqueda al escribir, cancelar
   lecturas anteriores. Añadir «Limpiar filtros».
4. Añadir las vistas «Todas», «Vencidas», «Hoy», «Próximos 7 días» y una
   consulta de completadas/canceladas. Esta última es un filtro de estados,
   no un registro de acciones ni de tareas eliminadas.
5. Al activar una vista rápida, retirar `status`, `dateField`, `dateFrom` y
   `dateTo`. Pueden conservarse búsqueda y orden. Al aplicar un filtro manual
   de estado o fecha, salir de la vista rápida.

| Parámetro            | Valores y comportamiento                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`             | Uno o varios enums, por ejemplo `status=PENDING&status=SCHEDULED`                                                                                                         |
| `search`             | Subcadena literal en nombre o descripción, sin distinguir mayúsculas; recorta espacios externos. No elimina acentos ni hace búsqueda difusa; `%`, `_` y `\` son literales |
| `dateField`          | `start` o `end`; por defecto `start` si hay un rango. Enviarlo solo excluye tareas sin esa fecha                                                                          |
| `dateFrom`, `dateTo` | Días `YYYY-MM-DD` inclusivos en Madrid; puede existir un único límite. Excluyen tareas sin la fecha elegida                                                               |
| `sortBy`             | `createdAt`, `priority`, `start`, `end`; por defecto `createdAt`                                                                                                          |
| `sortDirection`      | `asc` o `desc`; por defecto `asc`. Prioridad descendente: `HIGH`, `MEDIUM`, `LOW`                                                                                         |
| `view`               | `overdue`, `today`, `upcoming`; excluyen completadas y canceladas                                                                                                         |

Al ordenar por inicio o fin, las tareas sin fecha quedan al final en ambos
sentidos. Los empates de prioridad o fecha se resuelven por creación ascendente
y UUID. Conservar el orden del servidor; agrupar hijos visualmente puede cambiar
el orden global, así que en resultados filtrados es preferible mantener filas
planas con su contexto de principal.

Las vistas significan exactamente:

- **Vencidas:** fin anterior al instante actual si tiene hora; si solo tiene día,
  vence al terminar ese día. Sin fin no está vencida. La comparación con hora
  es estricta: en el instante exacto del fin todavía no aparece como vencida.
- **Hoy:** tareas cuyo inicio está en el día actual de Madrid. No incluye una
  tarea solo porque termine hoy o tenga recordatorio hoy.
- **Próximos 7 días:** inicio desde mañana hasta el séptimo día posterior a hoy,
  ambos incluidos. Excluye hoy y las tareas sin inicio.

Ejemplos válidos:

```text
/tasks?status=PENDING&status=SCHEDULED
/tasks?dateField=end&dateFrom=2026-10-12&dateTo=2026-10-18
/tasks?view=upcoming&search=planif&sortBy=priority&sortDirection=desc
/tasks?status=COMPLETED&status=CANCELLED
```

No hay filtro por prioridad, recordatorio o principal, ni orden por nombre.
No añadir `page`, `limit` o `offset`. Los recuentos obtenidos de una lista
filtrada solo representan ese resultado. Si se quieren contadores para otras
vistas, necesitarán sus propias consultas; pueden posponerse.

**Terminado cuando:** todos los filtros y vistas producen las consultas
esperadas, las combinaciones prohibidas no se envían y los resultados vacíos
permiten limpiar filtros. Un error de lectura no se presenta como cero tareas.

Fuentes: [FindTasksDto](../../LiLi-api/src/tasks/dto/find-tasks.dto.ts),
[preparación de filtros](../../LiLi-api/src/tasks/services/find-all-tasks/find-all-tasks.service.ts),
[consulta y ordenación](../../LiLi-api/src/tasks/repositories/prisma-task.repository.ts)
y [pruebas HTTP de organización](../../LiLi-api/test/tasks/tasks-http.e2e-spec.ts).

### Paso 12 · Completar la experiencia de recordatorios

La creación y edición ya incorporan `reminder` desde los pasos 6 y 7. Este paso
completa sus ayudas y su representación para que el usuario entienda lo guardado.

1. Mostrar el día y, si existe, la hora del recordatorio en el detalle. Si no
   tiene hora, explicar «Sin hora indicada: aviso a las 06:00 de Madrid».
   Conservar `time: null` en el modelo; no convertirlo a `'06:00'` al editar.
2. Explicar que se dirige al correo de Google del propietario. La web no puede
   elegir destinatario ni debe solicitar credenciales de Gmail.
3. Confirmar «Recordatorio guardado» tras guardar la tarea. El envío depende de
   que el servidor lo tenga habilitado y configurado; la API no publica esa
   configuración. Mostrar esa condición como ayuda, sin inventar un indicador
   «servicio activo».
4. Permitir quitarlo con `reminder: null`. Modificar la fecha o su modo de hora
   programa un aviso nuevo; repetir exactamente el mismo día y hora conserva
   su estado interno y no reenvía un recordatorio ya procesado.
5. En tareas completadas o canceladas, una fecha puede seguir guardada aunque
   los envíos pendientes se hayan anulado. Mostrarla como dato guardado y no
   como aviso activo; esas tareas no permiten editarla.
6. Explicar que completar, cancelar o eliminar anula los avisos pendientes.
   Quitar el recordatorio también elimina su programación. Ninguna de esas
   acciones puede retirar un correo cuyo envío ya está en curso.
7. No ejecutar temporizadores de envío en React, pedir permisos del navegador
   o mantener una pestaña abierta para que funcione. El worker es del servidor.

Comportamiento del backend relevante para el uso y las pruebas:

- Si está habilitado, revisa al arrancar y espera 30 segundos entre revisiones
  terminadas. La hora guardada no garantiza un envío instantáneo.
- Recupera retrasos de hasta 24 horas y caduca avisos más antiguos.
- Reintenta fallos temporales tras 1, 5, 15 y 60 minutos; los fallos permanentes
  no se reintentan. La web no tiene una operación de reintento manual.
- Guarda estados internos de envío, pero la respuesta de tarea solo contiene
  la fecha. No se pueden mostrar «Enviado», «Fallido», «Caducado», intentos o
  errores reales del correo.
- Un reinicio entre aceptación SMTP y guardado puede producir un duplicado;
  la aceptación SMTP tampoco confirma llegada a la bandeja de entrada.

**Terminado cuando:** se pueden guardar, cambiar y quitar recordatorios; la
fecha sin hora conserva su significado; los mensajes confirman el guardado y
no afirman una entrega que el frontend no puede consultar.

Fuentes: [worker](../../LiLi-api/src/reminders/reminders.worker.ts),
[hora por defecto](../../LiLi-api/src/reminders/utils/reminder-date.utils.ts),
[envío y reintentos](../../LiLi-api/src/reminders/services/send-pending-reminders/send-pending-reminders.service.ts),
[cambios desde tareas](../../LiLi-api/src/tasks/repositories/prisma-task.repository.ts)
y [pruebas de recordatorios](../../LiLi-api/test/reminders/reminders.e2e-spec.ts).

### Paso 13 · Verificar flujos, accesibilidad y despliegue

1. Añadir pruebas de comportamiento junto a cada funcionalidad con Vitest y
   jsdom, ya instalados. Simular la frontera HTTP para probar la interfaz;
   no copiar las pruebas internas de Prisma o del worker al frontend. Si se
   necesita una librería de pruebas adicional, justificarla antes de instalarla.
2. Cubrir especialmente los contratos de la web: serialización de fechas y
   consultas, manejo de `204`, sesión, formularios y respuestas tardías.
   Quitar `passWithNoTests` cuando existan las primeras pruebas de comportamiento.
3. Comprobar los recorridos reales contra la API. Las pruebas con HTTP simulado
   no verifican cookies, Google, cabeceras del proxy o entrega real de Gmail.
4. Revisar móvil y escritorio en ambos temas: labels, foco de teclado, errores
   asociados a campos, diálogos con retorno de foco, anuncios de carga/resultado
   y estados comunicados con texto además del color. Mantener acciones
   deshabilitadas mientras se guarda y conservar filtros y borradores cuando
   corresponda.
5. Ejecutar `pnpm run ci` en LiLi-web para comprobar lint, formato, compilación
   y pruebas con cobertura. Actualizar el README para describir lo que se haya
   implementado realmente.
6. Antes del despliegue, preparar un servidor que sirva `dist/` y dirija
   `/auth` y `/tasks` a la API bajo el mismo origen HTTPS. Conservar cabeceras y
   cookies; configurar `APP_ORIGIN` y registrar el callback público en Google.
   Si se añaden rutas SPA, preparar su retorno a `index.html` después de las
   rutas de API. Vite y `pnpm preview` no sustituyen ese proxy de producción.

| Recorrido              | Comprobación necesaria                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Acceso                 | Sin sesión, Google, retorno a `/`, recarga autenticada y logout `204`                                             |
| Sesión durante el uso  | Un `401` retira datos privados; un fallo de red ofrece reintento                                                  |
| Escrituras             | Una sesión válida permite guardar con el origen correcto; un `403` informa del rechazo                            |
| Tarea mínima           | Crear con nombre, consultar, editar una propiedad conservando las demás y eliminar                                |
| Fechas                 | Solo día, medianoche explícita, hora, vaciado, intervalo invertido y hora inexistente en Madrid                   |
| Subtareas              | Crear un hijo, abrir principal e hijo y mostrarlo aunque la principal no coincida con el filtro                   |
| Estados                | Programar sin inicio, conflicto con principal, completar con hijos pendientes y cancelar con un hijo completado   |
| Cambios familiares     | Cancelar o eliminar una principal refresca todos los hijos afectados                                              |
| Terminales             | Lectura sin edición/reapertura; eliminación permitida                                                             |
| Organización           | Estados repetidos, búsqueda literal, rango inclusivo, vistas incompatibles con filtros y fechas ausentes al final |
| Recordatorios          | Guardar sin inicio/fin, hora por defecto, cambiar fecha y quitarla sin afirmar entrega                            |
| Concurrencia y errores | Lectura antigua descartada, borrador conservado tras error, `404` y `409` con salida clara                        |

Para verificar envío real de recordatorios, habilitar Gmail de forma deliberada
en un entorno propio y comprobar recepción. Es una prueba operativa que envía
correo; las pruebas automáticas de la web deben usar respuestas simuladas.

**Terminado cuando:** las verificaciones locales pasan y los recorridos de
navegador demuestran que cookies, origen, fechas y operaciones familiares
funcionan de extremo a extremo. La configuración de producción debe comprobarse
en su entorno antes de dar el despliegue por terminado.

Fuentes: [scripts](../package.json), [configuración de pruebas](../vite.config.ts),
[arranque y despliegue de la API](../../LiLi-api/README.md),
[pruebas HTTP del backend](../../LiLi-api/test/tasks/tasks-http.e2e-spec.ts)
y [pruebas de autenticación](../../LiLi-api/test/auth/auth.e2e-spec.ts).

## 3. Hitos para organizar el trabajo

| Hito                  | Pasos                           | Resultado utilizable                                                                   |
| --------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| Sesión y lectura      | 1–5                             | Entrar, salir, ver tareas y abrir detalles                                             |
| Gestión completa      | 6–10                            | Crear y editar tareas/subtareas, manejar estados y eliminar                            |
| Organización y avisos | 11–12                           | Todas las consultas actuales y una experiencia fiel de recordatorios                   |
| Preparación de uso    | 13, con pruebas desde cada paso | Flujos verificados, documentación actualizada y configuración de alojamiento preparada |

No se necesita ampliar el backend para esos hitos. Exponer estado de entrega,
mejorar los errores del callback, compartir tareas o incorporar restauración
serían trabajos nuevos con contratos propios.

## 4. Observaciones de la revisión

- El esquema OpenAPI de
  [creación](../../LiLi-api/src/docs/components/schemas/tasks/create-task.yaml)
  conserva la frase «No hay envío de correos implementado». Está desactualizada:
  el worker, la persistencia y las pruebas de recordatorios ya existen. Para
  este plan se ha contrastado la documentación con el código; la corrección de
  ese archivo del backend queda fuera de esta tarea documental.
- El historial de estados terminales se puede consultar con `/tasks`, pero no
  equivale a un historial de acciones. No existe endpoint de auditoría.
- Hay pruebas del backend que describen los contratos revisados. Esta revisión
  ha leído su cobertura funcional; no ha ejecutado la suite ni ha enviado
  correos reales. La validación de este documento comprueba formato, enlaces
  locales y correspondencia de rutas/campos con el código.
