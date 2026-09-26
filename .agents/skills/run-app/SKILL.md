---
name: run-app
description: Apply when tempted to screenshot a page, drive the running app, or decide what proves a layout or dialog change works. Esposter — how a UI change is verified: never a browser the agent drives, and no screenshot suite (rejected: a production build per run, no findings). The offline CSS for a styling question, a component test when one is cheap, and the user's own eyes. Also covers launching the dev server for the user.
---

# Verifying a UI Change

Typecheck cannot see layout, so the question of what proves a visual change is real comes up on every one. The answer here is **not** a browser an agent drives.

## A browser never runs inside the edit loop

No headless Chrome, no CDP, no screenshot after each edit, no poll loop for async components. A dev server, a client-bundle warmup and a seeded session cost more wall clock than the edit, and inside the loop that wait is paid on every iteration. So while the change is being made: make it, run the check suite (`package-scripts`), and move on.

## No automated visual pass

**Rejected: a screenshot suite against approved baselines.** One was built for the agent console on `@nuxt/test-utils`' end-to-end mode (`setup({ browser: true })`, `createPage`, "playwright-core" driving the installed Chrome) and deleted. Every run paid a production build of the whole app, many minutes before the first capture, and the captures found nothing the user's own look had not already found. A component gallery (Storybook, Histoire) is rejected for the same reason plus its own: a second app to keep working with Nuxt, and stories that rot. Neither is re-proposed. The user's eyes are the acceptance check for layout.

## What replaces it

1. **For a styling change, generate the CSS and read it** — a form that generates nothing is the finding (`references/css-generation.md`).
2. **A component test, when it is cheap.** If the behaviour mounts under the repo's default Vitest setup and the assertions are about rendered structure or state a user depends on, write one — `testing` owns the conventions.
3. **Otherwise nothing, and say so.** A component test that only exists after mocking a large surface — a store graph, the tRPC client, a third-party component's internals, a browser API per assertion — is not worth its weight: it pins the mocks rather than the component, and it is the maintenance the next change pays. **Not adding the test is the correct outcome there** and needs no apology; the layout is the user's to eyeball.
4. **The user's own eyes** are the acceptance check for layout. Hand over what changed and what to look at, rather than claiming a look you did not take.

Never report a visual change as verified on the strength of typecheck, lint or a passing suite. Say which of the four above happened.

## Launching the dev server (for the user, not for a driver)

`pnpm dev --port 3001` from `apps/web` — 3000 is the user's; one server per directory, it binds `::1`, and never a temp script under `apps/web` while it runs (`references/dev-server.md`).

## Reference pages

- `references/css-generation.md` — when a styling question can be settled by the CSS UnoCSS generates.
- `references/dev-server.md` — when starting a dev server for the user, or reading what Vite serves.
