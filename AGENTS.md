# LiLi Web Agent Guidelines

LiLi Web is the React interface for the sibling LiLi API. Use TypeScript, React, Vite, Material UI, ESM, Node.js 24 or later, and pnpm. Material UI is installed with Emotion as its styling engine.

- Keep the frontend organized by feature. `src/app/` composes the interface; future features own their components, API interactions, and tests.
- Keep application business rules in the API. Do not import backend source or expose credentials to the browser.
- Preserve the API's session-cookie and Origin-checking contracts. Read the current API and its OpenAPI documentation before implementing integrations.
- Prefer the smallest coherent change. Add routing, state libraries, shared abstractions, and UI dependencies only when current requirements need them.
- Use strict TypeScript, type-only imports, explicit public return types, and the configured `#src/` alias. Local runtime imports use `.js` extensions.
- Follow ESLint, Prettier, and EditorConfig. Do not edit generated `dist/` or commit credentials.
- Write focused regression tests next to the behavior they protect. Test observable behavior and mock collaborators at their boundaries.
- Carry out ordinary local steps within the requested scope. Ask before installing or updating dependencies, destructive changes, external actions, or material scope expansion.
- After changes, run relevant tests, type-checking, linting, and formatting. Use `pnpm run ci` for substantial changes. Report verification limits and leave unrelated failures outside the task.
- Keep the README accurate to implemented behavior and accessible to someone unfamiliar with LiLi.

## Architecture shared with LiLi API

- Use the same feature ownership and vocabulary as the sibling API: `auth/`, `tasks/`, and genuinely shared code under `shared/`. `app/` owns frontend composition and routing.
- Keep each responsibility recognizable: `components/` renders the interface, `hooks/` coordinates React state and requests, and `api/` owns HTTP operations. Components must not call `fetch` directly.
- Name task HTTP operations `findAll`, `findByUuid`, `create`, `updateDetails`, `updateStatus`, and `delete`, matching the API controller. These are frontend adapters to the existing endpoints, not new backend services.
- Group a hook and its tests under `hooks/<operation>/` when it owns an independent flow. Keep coordinating hooks such as `useTaskActions` together when their state and lifecycle are shared; do not create a hook for every HTTP call.
- Put data contracts in `types/*.type.ts`, request inputs in `types/input/*.input.ts`, and enums in `types/enum/*.enum.ts`. Keep task data, request inputs, filters, and form/query state distinct. Use plain TypeScript types for browser data; do not copy Nest DTO decorators or introduce entity classes for identical JSON shapes.
- Put conversions in `mappers/`: task data to drafts, drafts to request inputs, and filters to query strings. Put runtime response checks and form validation in `validators/`. Keep presentation helpers in `utils/`; runtime labels do not belong in `types/`.
- Feature contracts and pure helpers must not depend on components or hooks. Components may import state contracts from `types/` without importing the hooks that implement them.
- Keep shared HTTP errors in `shared/errors/` and transport/readable HTTP feedback in `shared/http/`. Feature response validators stay with their feature.
- The API remains authoritative for ownership, lifecycle rules, persistence, and email delivery. Frontend checks provide feedback; preserve partial-update semantics and the distinction between an absent time and explicit midnight.
- Preserve React functions, hooks, props, composition, and effect cleanup. Add a service, repository, context, or dependency-injection layer only for a concrete frontend responsibility; resemblance to Nest alone is not a reason.
- Keep behavior tests beside their subject when moving or splitting files. Update all imports and mocks, remove obsolete files, and check for stale names after a structural refactor.

## Frontend and Skills

- LiLi is a private, self-hosted project for its creator and family. Favor simple, accessible interfaces and maintainable code based on concrete household needs.
- Use Material UI components for the frontend. Keep shared visual choices in the theme and use `sx` for local styling. Add reusable wrappers only when repeated behavior or styling justifies them.
- Use `vercel-react-best-practices` for React components, hooks, data fetching, and performance reviews. Apply its client-side React guidance to this Vite application. Next.js, React Server Components, SSR, and Vercel deployment examples do not establish project requirements.
- Use `vercel-composition-patterns` when designing or refactoring reusable components. Start with ordinary props and composition; add compound components or context when an actual component needs them.
- Use `material-ui-styling` when choosing between `sx`, `styled()`, theme overrides, and global styles, or when customizing component slots and states.
- Use `material-ui-theming` when creating or extending the theme, design tokens, or light/dark behavior. Implement theme features only when requested or needed by the current interface.
- Read each applicable skill's `SKILL.md` and the relevant referenced guide or rules. Sources and pinned revisions are recorded in `.agents/skills/README.md`.
- The installed MUI guides target Material UI v9. Before implementing MUI code, check `package.json`, the lockfile, and official documentation for the selected version. Installing a skill does not authorize installing application dependencies.
- Treat skills as guidance. The user's instructions, current repository code, and this file take precedence. Do not add libraries, memoization, state layers, or abstractions merely because a skill example uses them.
