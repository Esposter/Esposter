# Launching the Dev Server

Read when starting a dev server for the user, or reading what Vite serves.

The commands are for the Windows machine the repo is developed on: the launch runs in Git Bash, the cleanup in PowerShell.

**Port 3000 belongs to the user. An agent-started server always takes `--port 3001`**, so the two never race for a port and killing one never takes the other's session down:

```bash
# <scratch> is a directory outside the tree, for logs — substitute it before running
cd apps/web && nohup pnpm dev --port 3001 > "<scratch>/dev.log" 2>&1   # run_in_background
```

What bites, all of it cheaply:

- **One dev chain per checkout, whatever the port.** A second `pnpm dev` does not refuse to start, and it harms the running server before Nuxt starts: the script runs the workspace package build first, that build's tsdown clean deletes each package's `dist`, and the running server then fails with "ERR_LOAD_URL" for `packages/*/dist`. On the same port it also takes the running server over (`Taking over the dev server on port`, then `Stopped the dev server`). Before starting one, check for a listener on 3000 and 3001 (`Get-NetTCPConnection -State Listen -LocalPort 3000,3001`). If the user already has one up, use theirs and start no second. Do not reach for `NUXT_IGNORE_LOCK=1` either: it lets two servers fight over one `.nuxt` cache and corrupts the build for both.
- **It binds `::1`, not `127.0.0.1`.** `curl http://localhost:PORT` fails with connection-refused while the server is perfectly healthy. Use `http://[::1]:PORT`, or PowerShell's `Invoke-WebRequest` (which resolves both).
- **The first request builds the client bundle** and can sit for minutes; a 90s timeout looks like a hang. Give it 300s+ before concluding anything. Vize compiles each component on its first request in dev, and no pre-compile of every component runs at start (`$development` in `apps/web/nuxt.config.ts`).
- **A request made before the start finishes fails.** Vite's module-load call has a fixed 60s timeout, so a request that lands while the server is still building fails with `transport invoke timed out after 60000ms`. Wait for the `Vite dev server built` line, and never poll a request to see whether the server is ready.
- **Killing the wrapper leaves the server.** Stopping the background shell kills `pnpm`, not the `nuxt.mjs` child — it keeps the port and the lock. Kill by PID tree (`taskkill /PID <pid> /T /F`), and check `Get-NetTCPConnection -State Listen -LocalPort 3000,3001` afterwards.
- **A rebuilt workspace package is served stale.** The app serves a package's `dist` from outside its own root, which the dev server does not watch: after a rebuild the page keeps the module it first served until the dev server restarts. A screen that looks unchanged after a rebuild is stale, not wrong; ask for a restart before judging it.

**What a dev server is for:** reading what Vite actually serves — a transformed module, `/_nuxt/@vite/env` for the resolved `define` values, a resolved import graph. That is a fact a test cannot give you, and it is worth the boot. It is **not** for driving the app: no browser runs as part of a change, and the layout is the user's to look at (`SKILL.md`).

**Never write a temp script under `apps/web` while a dev server is running there.** Every create/delete triggers a Nitro rebuild, and a few in quick succession corrupt the dev build into `worker entry not found in .nuxt/dev/index.mjs`, which only a restart clears. Run throwaway scripts with `node --input-type=module --eval '<source>'` from `apps/web` instead — module resolution works from the cwd and nothing enters the watched tree.
