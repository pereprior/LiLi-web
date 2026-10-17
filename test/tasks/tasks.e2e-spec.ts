import { expect, test } from '@playwright/test';

test('creates, edits and deletes a task through the interface', async ({
  page,
}) => {
  const userUuid = '00000000-0000-4000-8000-000000000001';
  const taskUuid = '00000000-0000-4000-8000-000000000002';
  let task: Record<string, unknown> | null = null;
  const writes: { method: string; body: unknown }[] = [];
  await page.route('**/auth/me', (route) =>
    route.fulfill({ json: { uuid: userUuid, email: 'familia@example.com' } }),
  );
  await page.route(
    (url) => url.pathname === '/tasks' || url.pathname.startsWith('/tasks/'),
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() === 'POST') {
        const body = request.postDataJSON() as Record<string, unknown>;
        writes.push({ method: 'POST', body });
        task = {
          uuid: taskUuid,
          userUuid,
          parentUuid: null,
          name: body.name,
          description: body.description ?? null,
          status: 'PENDING',
          priority: body.priority,
          start: null,
          end: null,
          reminder: { date: '2026-10-15', time: '00:00' },
        };
        await route.fulfill({ status: 201, json: task });
      } else if (request.method() === 'PATCH') {
        const body = request.postDataJSON() as Record<string, unknown>;
        writes.push({ method: 'PATCH', body });
        task = { ...task, ...body };
        await route.fulfill({ json: task });
      } else if (request.method() === 'DELETE') {
        task = null;
        await route.fulfill({ json: { success: true } });
      } else
        await route.fulfill({
          json: path === '/tasks' ? (task ? [task] : []) : task,
        });
    },
  );
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Añadir tarea', exact: true })
    .first()
    .click();
  await page
    .getByRole('textbox', { name: 'Nombre', exact: true })
    .fill('Comprar pan');
  await page
    .getByLabel('Día de recordatorio', { exact: true })
    .fill('2026-10-15');
  await page.getByLabel('Hora de recordatorio', { exact: true }).fill('00:00');
  await page.getByRole('button', { name: 'Crear tarea', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Comprar pan', exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`task=${taskUuid}`));
  await expect(
    page.getByText('15/10/2026 · 00:00', { exact: true }),
  ).toBeVisible();
  expect(writes[0]).toEqual({
    method: 'POST',
    body: {
      name: 'Comprar pan',
      priority: 'MEDIUM',
      reminder: '2026-10-15T00:00',
    },
  });

  await page.getByRole('button', { name: 'Editar tarea', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Nombre', exact: true })
    .fill('Comprar pan integral');
  await page
    .getByRole('button', { name: 'Guardar cambios', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Comprar pan integral', exact: true }),
  ).toBeVisible();
  expect(writes[1]).toEqual({
    method: 'PATCH',
    body: { name: 'Comprar pan integral' },
  });

  await page
    .getByRole('button', { name: 'Eliminar tarea', exact: true })
    .click();
  await expect(
    page.getByText(/También se eliminarán todas sus subtareas/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Un poco de espacio para organizarte' }),
  ).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/lili-symbol.png',
  );
  const overflowing = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflowing).toBe(false);
});

test('opens a filtered subtask with the full family and removes private data on401', async ({
  page,
}) => {
  const parentUuid = '00000000-0000-4000-8000-000000000002';
  const childUuid = '00000000-0000-4000-8000-000000000003';
  const parent = {
    uuid: parentUuid,
    userUuid: 'user',
    parentUuid: null,
    name: 'Preparar viaje',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    start: null,
    end: null,
    reminder: null,
  };
  const child = {
    ...parent,
    uuid: childUuid,
    parentUuid,
    name: 'Reservar hotel',
    status: 'PENDING',
  };
  let expired = false;
  await page.route('**/auth/me', (route) =>
    route.fulfill({ json: { uuid: 'user', email: 'familia@example.com' } }),
  );
  await page.route(
    (url) => url.pathname === '/tasks' || url.pathname.startsWith('/tasks/'),
    async (route) => {
      const url = new URL(route.request().url());
      if (expired) {
        await route.fulfill({
          status: 401,
          json: { message: 'Unauthorized', statusCode: 401 },
        });
        return;
      }
      await route.fulfill({
        json:
          url.pathname === `/tasks/${childUuid}`
            ? child
            : url.pathname === `/tasks/${parentUuid}`
              ? parent
              : url.search
                ? [child]
                : [parent, child],
      });
    },
  );
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Buscar, filtrar y ordenar +' })
    .click();
  await page.getByRole('searchbox', { name: 'Buscar tareas' }).fill('hotel');
  await page
    .getByRole('button', { name: 'Aplicar filtros', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Preparar viaje', exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: /Reservar hotel.*Pendiente/ }).click();
  await expect(
    page.getByRole('button', { name: 'Ver principal: Preparar viaje' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Ver principal: Preparar viaje' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Preparar viaje', exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'Reservar hotel', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Volver a la lista' }).click();
  expired = true;
  await page.getByRole('button', { name: 'Recargar', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Entrar con Google' }),
  ).toBeVisible();
  await expect(
    page.getByText('familia@example.com', { exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText('Reservar hotel', { exact: true }),
  ).not.toBeVisible();
});

test('keeps a successful save distinct from a failed reload', async ({
  page,
}) => {
  let saved = false;
  let creates = 0;
  await page.route('**/auth/me', (route) =>
    route.fulfill({ json: { uuid: 'user', email: 'familia@example.com' } }),
  );
  await page.route(
    (url) => url.pathname === '/tasks' || url.pathname.startsWith('/tasks/'),
    async (route) => {
      if (route.request().method() === 'POST') {
        saved = true;
        creates += 1;
        await route.fulfill({
          status: 201,
          json: {
            uuid: '00000000-0000-4000-8000-000000000004',
            userUuid: 'user',
            parentUuid: null,
            name: 'Tarea guardada',
            description: null,
            priority: 'MEDIUM',
            status: 'PENDING',
            start: null,
            end: null,
            reminder: null,
          },
        });
      } else if (saved)
        await route.fulfill({
          status: 503,
          json: { message: 'No disponible', statusCode: 503 },
        });
      else await route.fulfill({ json: [] });
    },
  );
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Añadir tarea', exact: true })
    .first()
    .click();
  await page
    .getByRole('textbox', { name: 'Nombre', exact: true })
    .fill('Tarea guardada');
  await page.getByRole('button', { name: 'Crear tarea', exact: true }).click();
  await expect(
    page.getByText(
      /La operación se guardó, pero no se pudo actualizar el detalle/,
    ),
  ).toBeVisible();
  expect(creates).toBe(1);
});

test('creates a subtask and refreshes all children after cancelling their principal', async ({
  page,
}) => {
  const parentUuid = '00000000-0000-4000-8000-000000000005';
  const childUuid = '00000000-0000-4000-8000-000000000006';
  let parent = {
    uuid: parentUuid,
    userUuid: 'user',
    parentUuid: null,
    name: 'Ordenar la casa',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    start: null,
    end: null,
    reminder: null,
  };
  let child: Record<string, unknown> | null = null;
  let removed = false;
  const writes: unknown[] = [];
  await page.route('**/auth/me', (route) =>
    route.fulfill({ json: { uuid: 'user', email: 'familia@example.com' } }),
  );
  await page.route(
    (url) => url.pathname === '/tasks' || url.pathname.startsWith('/tasks/'),
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() === 'POST') {
        const body = request.postDataJSON() as Record<string, unknown>;
        writes.push(body);
        child = {
          ...parent,
          uuid: childUuid,
          parentUuid,
          name: body.name,
          status: 'PENDING',
          priority: body.priority,
        };
        await route.fulfill({ status: 201, json: child });
      } else if (request.method() === 'PATCH') {
        writes.push(request.postDataJSON());
        parent = { ...parent, status: 'CANCELLED' };
        child = { ...child, status: 'CANCELLED' };
        await route.fulfill({ json: parent });
      } else if (request.method() === 'DELETE') {
        removed = true;
        await route.fulfill({ json: { success: true } });
      } else
        await route.fulfill({
          json:
            path === '/tasks'
              ? removed
                ? []
                : child
                  ? [parent, child]
                  : [parent]
              : path.endsWith(childUuid)
                ? child
                : parent,
        });
    },
  );
  await page.goto(`/?task=${parentUuid}`);
  await page
    .getByRole('button', { name: 'Añadir subtarea', exact: true })
    .click();
  await expect(
    page.getByRole('textbox', { name: 'Nombre', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('textbox', { name: 'Nombre', exact: true })
    .fill('Ordenar los libros');
  await page.getByRole('button', { name: 'Crear tarea', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Ordenar los libros', exact: true }),
  ).toBeVisible();
  expect(writes[0]).toEqual({
    name: 'Ordenar los libros',
    priority: 'MEDIUM',
    parentUuid,
  });
  await page
    .getByRole('button', { name: 'Ver principal: Ordenar la casa' })
    .click();
  await page
    .getByRole('combobox', { name: 'Estado', exact: true })
    .selectOption('CANCELLED');
  await expect(page.getByText(/Se cancelará «Ordenar la casa»/)).toBeVisible();
  await page
    .getByRole('button', { name: 'Cancelar tarea y subtareas', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: /Ordenar los libros Cancelada/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Editar tarea', exact: true }),
  ).not.toBeVisible();
  expect(writes[1]).toEqual({ status: 'CANCELLED' });
  await page
    .getByRole('button', { name: 'Eliminar tarea', exact: true })
    .click();
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Un poco de espacio para organizarte' }),
  ).toBeVisible();
});

test('uses the live Vite proxy for an unauthenticated API request', async ({
  page,
}) => {
  test.skip(
    process.env.RUN_LIVE_API !== 'true',
    'Requires the sibling API running without a browser session.',
  );
  const auth = await page.request.get('/auth/me');
  expect(auth.status()).toBe(401);
  expect(await auth.json()).toEqual({
    message: 'Unauthorized',
    statusCode: 401,
  });
  const tasks = await page.request.get('/tasks');
  expect(tasks.status()).toBe(401);
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Entrar con Google' }),
  ).toBeVisible();
});
