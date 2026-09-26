# Launching the Dev Server

Read when starting a dev server for the user, or reading what Vite serves.

`pnpm dev` from `apps/web` (see `package-scripts`).

The commands are for the Windows machine the repo is developed on: the launch runs in Git Bash, the cleanup below in PowerShell.

**Port 3000 belongs to the user. An agent-started server always takes `--port 3001`**, so the two never race for a port and killing one never takes the other's session down:

```bash
# $SCRATCHPAD is the session scratchpad directory named in the system prompt — substitute it before running
cd apps/web && nohup pnpm dev --port 3001 > "$SCRATCHPAD/dev.log" 2>&1   # run_in_background
```

Four things bite, all of them cheaply:

- **One dev server per directory.** Nuxt takes a lock on `apps/web` and a second `pnpm dev` there refuses to start — `Another Nuxt dev server is already running (PID …)` — whatever port it was given. If the user already has one up, use theirs; do not start a second and do not reach for `NUXT_IGNORE_LOCK=1`, which lets two servers fight over one `.nuxt` cache and corrupts the build for both.
- **It binds `::1`, not `127.0.0.1`.** `curl http://localhost:PORT` fails with connection-refused while the server is perfectly healthy. Use `http://[::1]:PORT`, or PowerShell's `Invoke-WebRequest` (which resolves both).
- **The first request builds the client bundle** and can sit for minutes; a 90s timeout looks like a hang. Give it 300s+ before concluding anything.
- **Killing the wrapper leaves the server.** Stopping the background shell kills `pnpm`, not the `nuxt.mjs` child — it keeps the port and the lock. Kill by PID tree (`taskkill /PID <pid> /T /F`), and check `Get-NetTCPConnection -State Listen -LocalPort 3000,3001` afterwards.

**What a dev server is for:** reading what Vite actually serves — a transformed module, `/_nuxt/@vite/env` for the resolved `define` values, a resolved import graph. That is a fact a test cannot give you, and it is worth the boot. It is **not** for driving the app inside the edit loop; the one end-of-change pass above is the only browser run.

**Never write a temp script under `apps/web` while a dev server is running there.** Every create/delete triggers a Nitro rebuild, and a few in quick succession corrupt the dev build into `worker entry not found in .nuxt/dev/index.mjs`, which only a restart clears. Run throwaway scripts with `node --input-type=module --eval '<source>'` from `apps/web` instead — module resolution works from the cwd and nothing enters the watched tree.
