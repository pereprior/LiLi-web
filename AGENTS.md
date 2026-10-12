# LiLi Web Agent Guidelines

LiLi Web is the React interface for the sibling LiLi API. Use TypeScript, React, Vite, Material UI, ESM, Node.js 24 or later, and pnpm. Material UI is the chosen UI library; it has not been installed yet.

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
