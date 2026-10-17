# LiLi Web

LiLi is a private, self-hosted home assistant. This repository contains its React interface; the backend lives in the sibling `LiLi-api` project.

The web interface supports Google sign-in, session recovery and logout, task lists and details, creation and partial editing, one level of subtasks, manual status changes, deletion, search, filters, sorting, quick views, and email reminder dates. The API owns authentication, business rules and email delivery. Tasks belong to the current user; sharing, reopening terminal tasks, restoring deleted tasks and delivery tracking are not available in the current API.

## Development

Use Node.js 24 or later and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173`. Run the sibling API following its [README](../LiLi-api/README.md). Its `APP_ORIGIN` must be `http://localhost:5173`; Google's registered callback must be `http://localhost:5173/auth/google/callback`. The API redirects successful sign-in to `/`, where the web checks `/auth/me` again. Only accounts allowed by the API can sign in.

Vite proxies `/auth` and `/tasks` to `http://localhost:3000`. To change the target, create a local `.env` containing `API_TARGET=http://localhost:3000` and adjust the address. Vite reads this variable on the server; it is not exposed to browser code. Protected writes retain the browser's Origin or Referer and use the API's HttpOnly session cookie. Do not put Google, database or Gmail credentials in `VITE_*` variables.

The current API requires its Gmail sender and application password even with `REMINDERS_ENABLED=false`. Keep this configuration in the API. The frontend needs neither a Google SDK nor session tokens in local storage.

## Using the interface

After sign-in, use **Añadir tarea** to create a task. New tasks start as pending; dates do not change their state automatically. A detail can be reloaded or linked using `/?task=<uuid>`. Browser back and forward follow the selection, and returning to the list keeps its filters.

Each optional date accepts a day with or without a time. Dates and times refer to Madrid, independent of the device's timezone. Date-only values stay distinct from explicit midnight. Editing sends only changed fields; removing an optional field sends `null`. Failed validation or a failed write keeps the draft. If a creation loses its confirmation, check the complete list before sending it again. A confirmed write remains successful even if the subsequent reload fails.

Principal tasks show all their subtasks, including terminal children omitted by the active list filters. You can open the principal of a filtered subtask without changing the results. Status controls explain unavailable transitions; the API checks the final operation. Cancelling a principal requires confirmation and refreshes its children. Completed and cancelled tasks are read-only and can still be deleted. Deleting a principal also removes its children, with no undo operation.

Search and filters are submitted explicitly. **Vencidas**, **Hoy** and **Próximos 7 días** use the API's Madrid calendar rules and exclude terminal tasks. Manual date or status filters replace a quick view. **Completadas y canceladas** is a status filter. Counts describe only the current query, and rows retain the server's ordering.

Reminder dates are saved as part of a task. A reminder without a time uses 06:00 in Madrid; the frontend keeps its absent time. Delivery uses the owner's Google email and depends on the server configuration. The interface confirms saved dates, without reporting sent or failed emails. Completing, cancelling, deleting or clearing a reminder cancels pending sends; it cannot withdraw an email already being sent.

A `401` removes private tasks, detail and drafts and returns to sign-in. Connection failures offer a retry. A rejected write with `403` keeps the session and explains the origin check. A conflict refreshes the context while retaining the editing draft for review.

## Visual identity

The interface applies the [visual identity](docs/identidad-visual.md): purple accents, neutral surfaces, Spanish copy, and Material UI components. The original transparent purple symbol is included in the header and browser favicon. Typography uses system fonts; Inter remains a candidate for a later visual review.

Appearance offers light, dark and system modes. Material UI stores this preference under the existing `lili-color-mode` and `lili-color-scheme` keys and synchronizes it across tabs. Both themes share the central tokens in `src/app/theme.ts`. The responsive detail and forms become full-screen dialogs on small displays.

## Structure

- `src/app/` composes the session, header, appearance and tasks page; `theme.ts` owns shared visual choices.
- `src/auth/` owns the user contract, HTTP adapter, session hook and access screen.
- `src/tasks/components/page/tasks-page.tsx` composes the list, view controls and three task dialogs.
- `src/tasks/` owns its contracts and enums, API adapter, read and mutation hooks, list, filters, detail, forms, and presentation helpers. Tests live next to their behavior.
- `src/shared/http/` contains the small HTTP client and readable error handling used by both features.
- `test/setup.ts` cleans up component tests; `test/tasks/` contains task browser flows.
- `public/lili-symbol.png` preserves the original logo, shared by the header and favicon.

Within each feature, components, hooks and utilities are grouped by responsibility. In tasks, `components/` contains `page/`, `list/`, `detail/`, `form/`, `filters/` and `confirmation/`; `hooks/` contains `actions/`, `data/` and `selection/`; and `utils/` contains `dates/`, `form/` and `status/`. Each unit test stays beside its implementation. Authentication groups its access screen under `components/login/` and its session hook under `hooks/session/`; application components use `appearance/` and `branding/`.

The project uses strict TypeScript, ESM, React, Vite, Material UI with Emotion, ESLint, Prettier and Vitest. Browser code uses bundler resolution. Runtime imports use `#src/` with `.js` extensions. Session and task state stay in memory; there is no routing, global state, form or query library.

## Verification

```sh
pnpm run ci
```

This runs lint, formatting, type checks, build and Vitest with V8 coverage. Tests cover the HTTP contract and `204`, query serialization, session lifecycle, Madrid date serialization, partial updates, validation, terminal and family status controls, and discarded late responses.

Browser checks use Playwright Chromium in desktop and mobile sizes with light and dark themes:

```sh
pnpm exec playwright install chromium
pnpm test:browser
```

The browser suite starts Vite or uses an existing server at port 5173. Most flows simulate only the HTTP boundary. With the real sibling API running, add live unauthenticated checks for both proxy prefixes:

```sh
RUN_LIVE_API=true pnpm test:browser
```

The browser flows exercise task and subtask management, cancellation refresh, filtered family navigation, session expiration, successful saves followed by failed reads, and the favicon. Run CI and browser checks separately. Coverage is printed in the console; temporary test files stay under `node_modules/.cache/`.

The [implementation plan](docs/plan-implementacion-frontend.md) is implemented at the frontend level. Remaining checks are real Google sign-in, authenticated writes with real cookies and Origin, Gmail receipt, and production hosting. Complete keyboard navigation and focus restoration, detail reload/forward navigation, and recovery from an invalid Madrid daylight-saving time also need explicit verification.

## Production hosting

Run `pnpm build` to produce `dist/`. A production server must serve these files and proxy `/auth` and `/tasks` under the same HTTPS origin, preserving cookies and the browser's origin headers. Configure the API's public `APP_ORIGIN` and Google's callback accordingly. Vite and `pnpm preview` do not provide a production API proxy.
