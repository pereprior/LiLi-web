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

React Router handles navigation in the browser: `/` shows the authenticated tasks page, and `/login` shows Google sign-in. Opening `/` without a session redirects to `/login`; an authenticated visit to `/login` returns to `/`. Unknown interface paths return to `/`. Session checks finish before redirects, and connection failures keep the retry screen at the requested address.

After sign-in, use **Add task** to create a task. New tasks start as pending; dates do not change their state automatically. A detail can be reloaded or linked using `/?task=<uuid>`. Browser back and forward follow the selection, and returning to the list keeps its filters. React Router manages this selection in the query string; unrelated query parameters and URL fragments are preserved.

Each optional date accepts a day with or without a time. Dates and times refer to Madrid, independent of the device's timezone. Date-only values stay distinct from explicit midnight. Editing sends only changed fields; removing an optional field sends `null`. Failed validation or a failed write keeps the draft. If a creation loses its confirmation, check the complete list before sending it again. A confirmed write remains successful even if the subsequent reload fails.

Principal tasks show all their subtasks, including terminal children omitted by the active list filters. You can open the principal of a filtered subtask without changing the results. Status controls explain unavailable transitions; the API checks the final operation. Cancelling a principal requires confirmation and refreshes its children. Completed and cancelled tasks are read-only and can still be deleted. Deleting a principal also removes its children, with no undo operation.

Search and filters are submitted explicitly. **Overdue**, **Today** and **Next 7 days** use the API's Madrid calendar rules and exclude terminal tasks. Manual date or status filters replace a quick view. **Completed and cancelled** is a status filter. Counts describe only the current query, and rows retain the server's ordering.

Reminder dates are saved as part of a task. A reminder without a time uses 06:00 in Madrid; the frontend keeps its absent time. Delivery uses the owner's Google email and depends on the server configuration. The interface confirms saved dates, without reporting sent or failed emails. Completing, cancelling, deleting or clearing a reminder cancels pending sends; it cannot withdraw an email already being sent.

A `401` removes private tasks, detail and drafts and returns to sign-in. Connection failures offer a retry. A rejected write with `403` keeps the session and explains the origin check. A conflict refreshes the context while retaining the editing draft for review. Saving stays disabled while the context reloads or is unavailable; if the task has become completed or cancelled, the editor becomes read-only.

## Languages

The header offers **English**, **Español** and **Valencià**. English is the default and fallback language, independent of the browser's language. Your choice is saved under `lili-language` in local storage and restored after reloads, including the return from Google sign-in. If storage is unavailable, changing language still works for the current page.

Valencian uses the registered [BCP 47 variant `ca-valencia`](https://www.iana.org/assignments/lang-subtags-templates/valencia.txt), with its own translations. Labels, accessible names, validation, application errors, notices and dates follow the selected language; switching keeps open forms, task selection and filters. Task names, descriptions and messages supplied directly by the API keep their original text. Dates still use the API's Madrid calendar rules, with an absent time kept distinct from midnight. The page's `lang` and description also follow the choice.

Translations are bundled locally through i18next and react-i18next. Catalogs live under `src/shared/i18n/labels/`, grouped first by language (`en/`, `es/`, `ca-valencia/`) and then by section (`app.ts`, `auth.ts`, `common.ts`, `tasks.ts`). Task validation, errors and notices are included in each language's `tasks.ts`. Add keys to the English section and both translations together: TypeScript checks matching structures and translation keys. `src/shared/i18n/i18n.ts` registers the sections as namespaces. No translation service or additional account is needed.

## Visual identity

The interface applies the [visual identity](docs/identidad-visual.md): purple accents, neutral surfaces, natural language, and Material UI components. The original transparent purple symbol is included in the header and browser favicon. Typography uses system fonts; Inter remains a candidate for a later visual review.

Appearance offers light, dark and system modes. Material UI stores this preference under the existing `lili-color-mode` and `lili-color-scheme` keys and synchronizes it across tabs. Both themes share the central tokens in `src/app/theme.ts`. The responsive detail and forms become full-screen dialogs on small displays.

## Structure

- `src/main.tsx` provides the browser router; `src/app/` composes the session, routes, header, appearance and tasks page. `theme.ts` owns shared visual choices.
- `src/auth/` owns the user contract, HTTP adapter, session hook and access screen.
- `src/tasks/components/page/tasks-page.tsx` composes the list, view controls and three task dialogs.
- `src/tasks/` owns task contracts, HTTP operations, hooks, components, mappers, validators and presentation helpers. Tests live next to their behavior.
- `src/shared/http/` contains the HTTP client and readable feedback used by both features; `src/shared/errors/` owns the shared `HttpError`.
- `src/shared/i18n/` configures English, Spanish and Valencian; `labels/` groups translation catalogs by language and section.
- `test/setup.ts` cleans up component tests; `test/tasks/` contains task browser flows.
- `public/lili-symbol.png` preserves the original logo, shared by the header and favicon.

Both repositories use feature ownership, kebab-case filenames, explicit contracts, focused responsibilities and colocated tests. The web adapts that structure to React:

| Responsibility          | LiLi API                                       | LiLi Web                                                                                   |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Entry and composition   | Controllers and Nest modules                   | Pages, components and `app/` routing                                                       |
| Operation coordination  | Operation services with `execute`              | Hooks that coordinate requests and interface state                                         |
| External access         | Repository adapters and infrastructure clients | Feature HTTP adapters under `api/`                                                         |
| Contracts               | DTOs, entities and operation types             | Plain types under `types/`, request inputs under `types/input/`, enums under `types/enum/` |
| Conversion and checking | Mappers and validators                         | Mappers for drafts/payloads/query strings; validators for responses and forms              |
| Shared concerns         | `shared/` utilities and contracts              | `shared/` HTTP, errors and internationalization                                            |

The task HTTP adapter uses the API controller's operation names: `findAll`, `findByUuid`, `create`, `updateDetails`, `updateStatus` and `delete`. It handles URLs, methods and allowed request fields. Response validators check received JSON; mappers convert form drafts and filters. React hooks own loading, cancellation, session expiration and mutation feedback. Backend authorization, persistence and reminder delivery remain in LiLi-api.

In tasks, `components/` groups `page/`, `list/`, `detail/`, `form/`, `filters/` and `confirmation/`. Independent reads live in `hooks/find-all-tasks/` and `hooks/find-task-context/`; `hooks/actions/` coordinates mutation dialogs and feedback, and `hooks/selection/` owns URL selection. UI state contracts live in `types/`, so components do not import their types from hook implementations. `mappers/`, `validators/` and `utils/` separate conversion, validation and presentation. Authentication keeps its access screen under `components/login/`, session state under `hooks/session/` and response checks under `validators/`.

The browser uses functions, hooks and plain data types. There is no extra repository layer or Nest-style injection container; the existing HTTP boundary is sufficient. The [agent guidelines](AGENTS.md#architecture-shared-with-lili-api) record these conventions for future features.

The project uses strict TypeScript, ESM, React, React Router, Vite, Material UI with Emotion, ESLint, Prettier and Vitest. Browser code uses bundler resolution. Runtime imports use `#src/` with `.js` extensions. React Router uses its [declarative mode](https://reactrouter.com/start/declarative/installation) with `BrowserRouter`, `Routes` and `Route`; the existing hooks still own session checks and task requests. Session and task data stay in memory; there is no global state, form or query library.

## Verification

```sh
pnpm run ci
```

This runs lint, formatting, type checks, build and Vitest with V8 coverage. Tests cover language fallback, pluralization, localized dates and messages, session-aware redirects, task selection and browser history, the HTTP contract and `204`, query serialization, session lifecycle, Madrid date serialization, partial updates, validation, terminal and family status controls, and discarded late responses.

The GitHub Actions workflow runs separate jobs for type checking, build, test coverage, lint/formatting and browser tests on pushes and pull requests to `main`, following the sibling API's CI structure. Each job installs the locked dependencies and runs independently. The browser job installs Chromium and its system dependencies before Playwright runs. Live API checks remain opt-in.

Browser checks use Playwright Chromium in desktop and mobile sizes with light and dark themes:

```sh
pnpm exec playwright install chromium
pnpm test:browser
```

The browser suite starts Vite or uses an existing server at port 5173. Most flows simulate only the HTTP boundary. With the real sibling API running, add live unauthenticated checks for both proxy prefixes:

```sh
RUN_LIVE_API=true pnpm test:browser
```

The browser flows exercise the English default, language switching and persistence, login redirects and reloads, task detail reloads and back/forward navigation, task and subtask management, cancellation refresh, filtered family navigation, session expiration, successful saves followed by failed reads, and the favicon. Run CI and browser checks separately. Coverage is printed in the console; temporary test files stay under `node_modules/.cache/`.

The [implementation plan](docs/plan-implementacion-frontend.md) is implemented at the frontend level. Remaining checks are real Google sign-in, authenticated writes with real cookies and Origin, Gmail receipt, and production hosting. Complete keyboard navigation and focus restoration, and recovery from an invalid Madrid daylight-saving time also need explicit verification.

## Production hosting

Run `pnpm build` to produce `dist/`. A production server must serve these files and proxy `/auth` and `/tasks` under the same HTTPS origin, preserving cookies and the browser's origin headers. Keep both API prefixes ahead of the SPA fallback; all other interface paths, including `/login`, must fall back to `index.html` so direct links and reloads work. Configure the API's public `APP_ORIGIN` and Google's callback accordingly. Vite and `pnpm preview` do not provide a production API proxy.
