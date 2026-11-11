# A driven browser

Read when a change's claim is one no test reaches — pointer hit-testing, drag and drop, a second visit to a route, a Phaser or three.js lifecycle, or anything a happy-dom suite does not model. Once, after all the edits, never in the edit loop (`SKILL.md`).

- **The server is the dev server on `--port 3001`**, from `apps/web` (`dev-server.md`), in the background. A fresh one re-optimises its dependencies on the first request and reloads the page, so a script waits for the app to mount (`document.querySelector("#__nuxt").__vue_app__`) and reloads until it has. A rebuilt workspace package is served stale until the server restarts.
- **The driver is a throwaway Playwright script in the scratchpad**, run from `scripts`, which holds `playwright`, as `node --input-type=module --eval "$(cat <script>)"` so its imports resolve from the working directory. It launches the machine's installed Chrome (`channel: "chrome"`, `args: ["--enable-unsafe-webgpu"]` for three.js) and records `pageerror` and `console.error`, since a defect the suites missed shows there first. It reaches the server at `http://[::1]:3001`, which is where it binds.
- **A route changes by the router, not by a load:** `document.querySelector("#__nuxt").__vue_app__.config.globalProperties.$router.push(path)`, so a remount, which a load never exercises, is what runs.
- **A component the app mounts only behind a sign-in is mounted on a throwaway page** under `apps/web/app/pages`, which is deleted before the commit. The signed-in driver step below puts the browser in as the seeded driven user, and a run keeps its rows in a database and an emulator of its own, while a flow that publishes still reaches the dev Azure services `apps/web/.env` names, which is why a run records every request host.
- **A drag is the mouse API, in a viewport tall enough that nothing scrolls.** `page.dragAndDrop` waits for its target to receive pointer events, so it times out on exactly the target a covering block hides. Read what is topmost at the target with `document.elementsFromPoint` while the drag is under way, and the computed `pointer-events` up the target's ancestors.
- **A component that reads custom properties its parent sets is given them on the throwaway page's wrapper.** A grid tile's `--dashboard-handle` and `--dashboard-cap` are declared by the tile, so a probe without them leaves `right: var(--dashboard-cap)` invalid and the box falls to its static position, which reads as a layout defect that is not one.
- **A claim is proved by the control run.** Take the fix out and show the defect, put it back and show the drop, as a regression test is proved with its fix reverted (`testing` skill). The control sets the old value itself, as an inline style, and the script prints the measured element's markup and computed value first: a class swapped onto an element whose utility is an attribute changes nothing, and a control that changes nothing proves nothing.
- **The blob container's CORS allows the app's own origin only,** so a page that reads the hosted game data from another port is given the header by `page.route` on `https://devstesposter001.blob.core.windows.net/**`, which fetches and fulfils with `access-control-allow-origin`.
- **Leave nothing behind:** the page removed, the server stopped (the `nuxt.mjs dev` process, not only its `pnpm` wrapper), and the scripts and screenshots in the scratchpad.

## The signed-in driver step

The app's pages that need a person to be signed in are reached through a development-only route, `POST /api/dev/session`. The dev server registers it under `nuxt dev` alone (`apps/web/modules/devSession.ts`), and it signs in the one seeded driven user, `DRIVEN_USER_ID` (`packages/shared/src/services/devSeed/constants.ts`). It refuses every request unless the server is not in production and its database is on this machine, and a refused request writes no session. Nothing outside a run enables it.

A run uses a database and an emulator of its own, so the owner's dev data is never read or written. `<scratch>` is a directory outside the tree, and every variable below is set in the shell that runs the driver, never written to a file.

1. **Start the run's emulator at its own location and ports**, from `apps/web` (`azurite` is its dependency), in the background:

   ```bash
   cd apps/web && nohup pnpm exec azurite --silent --skipApiVersionCheck --location "<scratch>/driven-azurite" --blobPort 11000 --queuePort 11001 --tablePort 11002 > "<scratch>/azurite.log" 2>&1   # run_in_background
   ```

2. **Name the run's storage in a connection string.** Its account key is the development key Azurite's README publishes for its default account, which is not a secret and is never committed. Substitute it for the placeholder:

   ```bash
   export AZURE_STORAGE_ACCOUNT_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=<Azurite's published development key>;BlobEndpoint=http://127.0.0.1:11000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:11001/devstoreaccount1;TableEndpoint=http://127.0.0.1:11002/devstoreaccount1;"
   ```

   The module that starts the default emulator runs only for `UseDevelopmentStorage=true`, so this string starts nothing and leaves the owner's emulator alone.

3. **Aim the database address at the run's database**: the owner's `DATABASE_URL` from `apps/web/.env` with its database replaced by `driven_session`. The address is read into the variable without being printed:

   ```bash
   export DATABASE_URL="$(node --env-file-if-exists=apps/web/.env --input-type=module --eval 'const url = new URL(process.env.DATABASE_URL); url.pathname = "/driven_session"; process.stdout.write(url.toString());')"
   ```

   The variables set here win over `apps/web/.env`, since the configuration loader fills a key from the file only when the environment does not already hold it. Task 4.2 of the `architecture-driven-session` change confirms that precedence on a real run.

4. **Seed the run's database and its emulator**, from the repo root. The seed creates `driven_session` when it is absent, migrates it and writes the dataset into it and into the run's emulator. It stops before its first write when the database is not `driven_session` or the storage is the default emulator or not on this machine, and a rerun converges on the same rows:

   ```bash
   pnpm -C scripts dev:seed
   ```

5. **Start the dev server** on the port the reference names, in the same shell so it inherits steps 2 and 3:

   ```bash
   cd apps/web && nohup pnpm dev --port 3001 > "<scratch>/dev.log" 2>&1   # run_in_background
   ```

6. **Sign the browser in once, then browse with the same context.** `context.request` shares the browser context's cookie jar, so the one POST leaves the session cookie for every later navigation:

   ```js
   const signIn = await context.request.post("http://[::1]:3001/api/dev/session");
   // signIn.status() is 204, and the browser's jar now holds the session cookie
   await page.goto("http://[::1]:3001/messages");
   ```

   The pages a signed-in driver check opens are `/messages` (the room and its messages), `/messages/friends`, `/messages/draftsandsent`, `/resource-explorer` and `/achievements`. A refused POST answers `404`, the answer a server without the route gives, so a `404` is read against the server's `APP_ENV`, its database address and whether it started after the route was added.

**Leave nothing behind:** stop the dev server by its PID tree, stop the emulator, and delete `<scratch>`. The `driven_session` database stays on the server for the next run, and it is dropped only when the owner asks.
