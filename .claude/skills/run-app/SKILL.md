---
name: run-app
description: Esposter — how a UI change is verified, and why an agent never drives the app in a browser to do it. Driving Chrome over CDP is banned here (flaky and slow); the alternatives are a component test when one is cheap under the default setup, and otherwise the user's own eyes. Also covers launching the dev server for the user. Apply when tempted to screenshot a page, drive the running app, or decide what proves a layout or dialog change works.
---

# Verifying a UI Change

Typecheck cannot see layout, so the question of what proves a visual change is real comes up on every one. The answer here is **not** a browser an agent drives.

## Driving the app in a browser is banned

No headless Chrome, no CDP, no screenshot loop, no seeded session to get past `middleware: "auth"` — not as a fallback, not "just this once for a layout change". Two reasons, and neither is fixable by a better script:

- **There is no standard for what "it looks right" means**, so the check is flaky by construction. A screenshot proves the page rendered, not that the spacing is the spacing that was asked for, and every one of these runs ends in a judgement call an agent is in no position to make.
- **It is slow enough to dominate the change.** A dev server, a client-bundle warmup, a seeded session row to delete afterwards and a poll loop for async components cost more wall clock than the edit, and the wait is spent on every iteration.

So: make the change, run the check suite (`package-scripts`), and say plainly what you did not verify.

## What replaces it

1. **A component test, when it is cheap.** If the behaviour mounts under the repo's default Vitest setup and the assertions are about rendered structure or state a user depends on, write one — `testing` owns the conventions.
2. **Otherwise nothing, and say so.** A component test that only exists after mocking a large surface — a store graph, the tRPC client, Vuetify internals, a browser API per assertion — is not worth its weight: it pins the mocks rather than the component, and it is the maintenance the next change pays. **Not adding the test is the correct outcome there** and needs no apology; the layout is the user's to eyeball.
3. **The user's own eyes** are the acceptance check for anything visual. Hand over what changed and what to look at, rather than claiming a look you did not take.

Never report a visual change as verified on the strength of typecheck, lint or a passing suite. Say which of the three above happened.

## Launching the dev server (for the user, not for a driver)

`pnpm dev` from `packages/app` (see `package-scripts`).

**Port 3000 belongs to the user. An agent-started server always takes `--port 3001`**, so the two never race for a port and killing one never takes the other's session down:

```bash
# $SCRATCHPAD is the session scratchpad directory named in the system prompt — substitute it before running
cd packages/app && nohup pnpm dev --port 3001 > "$SCRATCHPAD/dev.log" 2>&1   # run_in_background
```

Four things bite, all of them cheaply:

- **One dev server per directory.** Nuxt takes a lock on `packages/app` and a second `pnpm dev` there refuses to start — `Another Nuxt dev server is already running (PID …)` — whatever port it was given. If the user already has one up, use theirs; do not start a second and do not reach for `NUXT_IGNORE_LOCK=1`, which lets two servers fight over one `.nuxt` cache and corrupts the build for both.
- **It binds `::1`, not `127.0.0.1`.** `curl http://localhost:PORT` fails with connection-refused while the server is perfectly healthy. Use `http://[::1]:PORT`, or PowerShell's `Invoke-WebRequest` (which resolves both).
- **The first request builds the client bundle** and can sit for minutes; a 90s timeout looks like a hang. Give it 300s+ before concluding anything.
- **Killing the wrapper leaves the server.** `TaskStop` on the background shell kills `pnpm`, not the `nuxt.mjs` child — it keeps the port and the lock. Kill by PID tree (`taskkill /PID <pid> /T /F`), and check `Get-NetTCPConnection -State Listen -LocalPort 3000,3001` afterwards.

**What a dev server is for:** reading what Vite actually serves — a transformed module, `/_nuxt/@vite/env` for the resolved `define` values, a resolved import graph. That is a fact a test cannot give you, and it is worth the boot. It is **not** for driving the app; see the ban above.

**Never write a temp script under `packages/app`.** Every create/delete triggers a Nitro rebuild, and a few in quick succession corrupt the dev build into `worker entry not found in .nuxt/dev/index.mjs`, which only a restart clears. Run throwaway scripts with `node --input-type=module --eval '<source>'` from `packages/app` instead — module resolution works from the cwd and nothing enters the watched tree.
