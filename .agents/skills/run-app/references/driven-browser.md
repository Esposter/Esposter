# A driven browser

Read when a change's claim is one no test reaches — pointer hit-testing, drag and drop, a second visit to a route, a Phaser or three.js lifecycle, or anything a happy-dom suite does not model. Once, after all the edits, never in the edit loop (`SKILL.md`).

- **The server is the dev server on `--port 3001`**, from `apps/web` (`dev-server.md`), in the background. A fresh one re-optimises its dependencies on the first request and reloads the page, so a script waits for the app to mount (`document.querySelector("#__nuxt").__vue_app__`) and reloads until it has. A rebuilt workspace package is served stale until the server restarts.
- **The driver is a throwaway Playwright script in the scratchpad**, run from `scripts`, which holds `playwright`, as `node --input-type=module --eval "$(cat <script>)"` so its imports resolve from the working directory. It launches the machine's installed Chrome (`channel: "chrome"`, `args: ["--enable-unsafe-webgpu"]` for three.js) and records `pageerror` and `console.error`, since a defect the suites missed shows there first. It reaches the server at `http://[::1]:3001`, which is where it binds.
- **A route changes by the router, not by a load:** `document.querySelector("#__nuxt").__vue_app__.config.globalProperties.$router.push(path)`, so a remount, which a load never exercises, is what runs.
- **A component the app mounts only behind a sign-in is mounted on a throwaway page** under `apps/web/app/pages`, which is deleted before the commit. The signed-in driver step below puts the browser in as the seeded driven user, and the run's rows are the local D1 files its seed writes, while a flow that publishes still reaches the dev R2 buckets through the R2 credentials `apps/web/.env` holds, which is why a run records every request host.
- **A drag is the mouse API, in a viewport tall enough that nothing scrolls.** `page.dragAndDrop` waits for its target to receive pointer events, so it times out on exactly the target a covering block hides. Read what is topmost at the target with `document.elementsFromPoint` while the drag is under way, and the computed `pointer-events` up the target's ancestors.
- **A component that reads custom properties its parent sets is given them on the throwaway page's wrapper.** A grid tile's `--dashboard-handle` and `--dashboard-cap` are declared by the tile, so a probe without them leaves `right: var(--dashboard-cap)` invalid and the box falls to its static position, which reads as a layout defect that is not one.
- **A claim is proved by the control run.** Take the fix out and show the defect, put it back and show the drop, as a regression test is proved with its fix reverted (`testing` skill). The control sets the old value itself, as an inline style, and the script prints the measured element's markup and computed value first: a class swapped onto an element whose utility is an attribute changes nothing, and a control that changes nothing proves nothing.
- **A page that reads the hosted game data from another origin** is given the response header its bucket's CORS does not answer for that origin: `page.route` on the environment's assets host (`PUBLIC_ASSETS_BASE_URL_MAP` in `scripts/src/services/cloudflare/constants.ts`) fetches the object and fulfils it with `access-control-allow-origin`.
- **Leave nothing behind:** the page removed, the server stopped (the `nuxt.mjs dev` process, not only its `pnpm` wrapper), and the scripts and screenshots in the scratchpad.

## The signed-in driver step

The app's pages that need a person to be signed in are reached through a development-only route, `POST /api/dev/session`. The dev server registers it under `nuxt dev` alone (`apps/web/modules/devSession.ts`), and it signs in the one seeded driven user, `DRIVEN_USER_ID` (`packages/shared/src/services/devSeed/constants.ts`). It refuses every request unless the server is not in production and its `BASE_URL` is a local address, and a refused request writes no session. Nothing outside a run enables it.

A run seeds the local D1 files the dev server reads, and nothing it does reaches a remote database. The seed's bindings are Miniflare's local files under `DEV_SEED_PERSIST_ROOT` (`scripts/src/services/devSeed/constants.ts`, the local Wrangler state the dev server reads), the same state the dev server reads, so the rows a run writes are the local dev data itself. `<scratch>` is a directory outside the tree for the run's logs and screenshots.

1. **Seed the local databases**, from the repo root. The seed migrates both local D1 databases and writes the dataset into them, and a rerun converges on the same rows:

   ```bash
   pnpm -C scripts dev:seed
   ```

2. **Start the dev server** on the port the reference names, in the background:

   ```bash
   cd apps/web && nohup pnpm dev --port 3001 > "<scratch>/dev.log" 2>&1   # run_in_background
   ```

3. **Sign the browser in once, then browse with the same context.** `context.request` shares the browser context's cookie jar, so the one POST leaves the session cookie for every later navigation:

   ```js
   const signIn = await context.request.post("http://[::1]:3001/api/dev/session");
   // signIn.status() is 204, and the browser's jar now holds the session cookie
   await page.goto("http://[::1]:3001/messages");
   ```

   The pages a signed-in driver check opens are `/messages` (the room and its messages), `/messages/friends`, `/messages/draftsandsent`, `/resource-explorer` and `/achievements`. A refused POST answers `404`, the answer a server without the route gives, so a `404` is read against the server's `APP_ENV`, its `BASE_URL` and whether it started after the route was added.

**Leave nothing behind:** stop the dev server by its PID tree and delete `<scratch>`. The seeded local D1 files stay in the local Wrangler state the dev server reads, and the next run's seed converges on them.
