# LiLi Web

LiLi is a private, self-hosted home assistant. This repository contains the starting point for its web interface; the backend lives in the sibling `LiLi-api` project.

For now, the application only renders a placeholder page. Sign-in, tasks, reminders, routing, and API calls have not been implemented.

## Development

Use Node.js 24 or later and pnpm. Install dependencies with `pnpm install` for the initial setup. Once the generated `pnpm-lock.yaml` is committed, use `pnpm install --frozen-lockfile` for reproducible installations.

Run `pnpm dev` and open `http://localhost:5173`. The placeholder works without the API. To change the development proxy target, copy `.env.example` to `.env` and edit `API_TARGET`; the default is `http://localhost:3000`. This variable is read by Vite's server configuration and is not exposed to the browser.

The project uses React and Vite, with TypeScript, ESM, ESLint, Prettier, and Vitest, matching the API's shared tools and strict TypeScript settings. Browser code uses TypeScript's bundler resolution instead of the API's NodeNext resolution. Imports can use `#src/`, and local TypeScript runtime imports keep `.js` extensions.

## Structure

- `src/main.tsx` mounts React and loads global styles.
- `src/app/app.tsx` composes the application.
- `src/styles.css` contains the initial global styles.
- `vite.config.ts` configures React, aliases, the development proxy, and Vitest.

Add future functionality under feature-owned directories such as `src/auth/`, `src/tasks/`, or `src/reminders/`. Keep business rules in the API. Add shared code only when more than one feature actually needs it.

## Connecting to the API

The development server proxies `/auth` to the API without rewriting the path or the request's Origin header. Future browser requests can use relative URLs, with the API retaining ownership of Google OIDC and its HttpOnly session cookies. The front should not receive Google client secrets or store session tokens.

For the current API's authentication flow to run through this proxy, its `APP_ORIGIN` must be `http://localhost:5173`, and Google's registered callback must be `http://localhost:5173/auth/google/callback`. The API still listens on port 3000. These are instructions for future integration; this scaffold does not change the API or Google configuration.

The API currently redirects a successful callback to `/auth/me`, which returns JSON. A return to the web interface will need to be agreed and implemented with the login feature. The API checks Origin or Referer on protected writes, so preserve those headers rather than rewriting them to bypass the check.

Vite's proxy is for development. Production hosting will need to serve the built frontend and route the API endpoints under the same public origin. `pnpm preview` only previews the static build; it does not provide a production API proxy.

## Verification

- `pnpm typecheck` checks browser code and Node configuration.
- `pnpm lint` and `pnpm format:check` check style.
- `pnpm build` checks types and generates `dist/`.
- `pnpm test`, `pnpm test:watch`, and `pnpm test:coverage` use Vitest with jsdom and V8 coverage.
- `pnpm run ci` runs lint, formatting, build, and tests with coverage.

There are no behavior tests yet. Vitest explicitly allows an empty suite while this project is only a scaffold. Add focused `*.spec.ts` or `*.spec.tsx` tests alongside features as they are implemented, and remove `passWithNoTests` at that point.
