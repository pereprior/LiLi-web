# LiLi Web Agent Guidelines

LiLi Web is the React interface for the sibling LiLi API. Use TypeScript, React, Vite, ESM, Node.js 24 or later, and pnpm.

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
