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

1. **For a styling change, generate the CSS and read it.** Whether a utility resolves at all, and to which
   property, is a question UnoCSS answers offline — no browser, no judgement call, no flake. It settles exactly
   the class of finding that otherwise gets parked as "needs eyes on the page": whether an attributify form is
   equivalent to the `class` form it replaces, whether an arbitrary value is ambiguous between two properties,
   whether a token is generated for a value a dynamic binding hides from the scanner.

   The script has to sit in `apps/web` — it imports `./uno.config`, and bare specifiers resolve from the
   file's own location — so write it there, run it, and delete it. With a dev server up that create/delete pair
   triggers a Nitro rebuild (the warning at the end of this page), so stop the server first or accept the rebuild.

   ```ts
   // apps/web/unoGenerate.ts — pnpm exec tsx ./unoGenerate.ts '<div max-h="[80vh]" />' 80vh
   import { createGenerator } from "unocss";

   import unoConfig from "./uno.config";

   const generator = await createGenerator(unoConfig);
   const { css } = await generator.generate(process.argv[2] ?? "", { preflights: false });
   console.log(
     css
       .split("\n")
       .filter((line) => line.includes(process.argv[3] ?? ""))
       .join("\n"),
   );
   ```

   Filter the output, or the safelist buries the one line that answers the question. **A form that generates
   nothing is the finding**, and it looks identical to a form that works: `bg-image="[var(--x)]"` produces no
   rule at all, while `bg="[var(--x)]"` produces `background-color`, so a gradient written either way is lost
   silently. `bg="[image:--x]"` is the one that produces `background-image`.

2. **A component test, when it is cheap.** If the behaviour mounts under the repo's default Vitest setup and the assertions are about rendered structure or state a user depends on, write one — `testing` owns the conventions.
3. **Otherwise nothing, and say so.** A component test that only exists after mocking a large surface — a store graph, the tRPC client, a third-party component's internals, a browser API per assertion — is not worth its weight: it pins the mocks rather than the component, and it is the maintenance the next change pays. **Not adding the test is the correct outcome there** and needs no apology; the layout is the user's to eyeball.
4. **The user's own eyes** are the acceptance check for layout. Hand over what changed and what to look at, rather than claiming a look you did not take.

Never report a visual change as verified on the strength of typecheck, lint or a passing suite. Say which of the four above happened.

## Launching the dev server (for the user, not for a driver)

`pnpm dev` from `apps/web` (see `package-scripts`).

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
