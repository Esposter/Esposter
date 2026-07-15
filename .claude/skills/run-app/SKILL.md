---
name: run-app
description: Esposter — how to launch the app and drive it in a real browser to verify UI changes: the dev server's port fallback and client-bundle warmup, seeding a better-auth session for auth-gated routes, driving headless Chrome over CDP with no extra dependencies, and the two traps (temp files under packages/app corrupt the dev build; async components resolve long after the document is complete). Apply when verifying a UI change visually, screenshotting a page, or reproducing something that only shows up in the running app.
---

# Running and Driving the App

Typecheck cannot see layout. Any change to spacing, structure, or a dialog needs the real app. There is no Playwright here and no need for it — local Chrome plus CDP is enough.

## Dev server

`pnpm dev` from `packages/app` (see `package-scripts`). Two things bite:

- **Port 3000 is usually taken**; it falls back to **3001**. Read the port out of the log — never assume.
- The **first request returns `{"error":"Dev server is unavailable"}`** while Vite builds the client bundle. That is not a failure. Warm it with `curl` and retry until it serves.

**Never write a temp script under `packages/app`.** Every create/delete triggers a Nitro rebuild, and a few in quick succession corrupt the dev build into `worker entry not found in .nuxt/dev/index.mjs`, which only a restart clears. Run throwaway scripts with `node --input-type=module --eval '<source>'` from `packages/app` instead — module resolution works from the cwd and nothing enters the watched tree.

## Getting past `middleware: "auth"`

Only social providers are configured, so OAuth is not drivable. Seed a session against the local Postgres in `packages/app/.env` instead:

1. Attach to an **existing** user — don't invent one.
2. Insert into `sessions`. `updatedAt` is `NOT NULL` with no default (the `pgTable` wrapper adds it), so omitting it is a not-null violation.
3. Build the cookie as `better-auth.session_token=<token>.<signature>`, signature from `makeSignature(token, BETTER_AUTH_SECRET)` (`better-auth/crypto`). This mirrors better-auth's own `signCookieValue`.
4. **Delete the row when done.**

Confirm it worked against `/api/auth/get-session` before blaming the UI.

## Driving Chrome

Launch local Chrome headless with `--remote-debugging-port`, a scratchpad `--user-data-dir`, and `--no-sandbox`; drive it over CDP from a script using Node's **global `WebSocket`** — no dependency to install. `Network.setCookie` → `Page.navigate` → `Page.captureScreenshot`. `Runtime.evaluate` clicks through menus and dialogs and reads back DOM state.

**Always look at the screenshot.** A blank or error frame is a failed launch, not a passing check.

## Poll the DOM, never sleep

Async components resolve **long after** `readyState === 'complete'` — a store filled by a tRPC call in an `App.vue`-level component can take ~20s in dev. Screenshot before that and the page looks empty, which reads as a bug that isn't there. Gate the screenshot on the thing you came to see (`document.querySelectorAll('<the real selector>').length > 0`), never a fixed sleep. See `context-efficiency`.

If a page renders empty, find who populates the store before assuming it's broken — it is often mounted in `App.vue`, not the page.
