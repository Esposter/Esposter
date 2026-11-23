# Verification note

The evidence the change's tasks name, recorded where it was taken.

## 4.3: the first visit shows the download on the bar

A driven run on the dev server (`pnpm dev --port 3001`, Chrome under Playwright, a fresh browser profile). The Preloader frame shows the download's percentage on its bar mid-download (6%), the share held is the bar's value, and the title scene starts once Phaser's pass completes. The bar's whole-share behaviour is held by the composable's test (`packages/hosted-assets`, "downloads are shown on the loading bar as the share held, whole once every file is held"). The failed download is the composable's test "a failed download does not start the game", which asserts the status is failed and `onHeld` is never called; a driven run with every hosted request aborted stayed on the Preloader for 30 s and never reached the title.

## 6.1: the dungeons suites with the network refused

`pnpm -C apps/web exec vitest run app/services/dungeons` under a preloaded guard that rejects every `fetch` to a host other than localhost: 28 files, 71 tests, exit 0. The guard is a `fetch` override, not an operating-system network cut, so it holds for the suites' `fetch` calls and no more.

## 6.2: the title, the world and the battle on the dev server

A driven run on `pnpm dev --port 3001` against `hosted.dev.esposter.com`, on the tree after the binaries and the generator were removed:

- Title reached 7.3 s after navigation; World at 10.2 s, after Space is held; the world's map, its NPCs and its menu (Enter) draw from the hosted objects.
- Battle entered through the phaser store's `switchToScene(Battle)` with the party's first monster as the enemy, since the random walk did not reach the grass's encounter tiles in the time of the run. The battle draws its hosted background, monster sprite and text, and its audio is unlocked and running.
- Hosted responses: 163 in all for 76 unique objects, every one 200, none failed; 20 of them MP3 sound files, all 200; none after the world started.
- Page errors and console errors: none. The one console error seen in earlier runs, a Content Security Policy refusal of `http://localhost:3001/public-app-assets/logo.png`, is the local placeholder origin's logo and not the dungeons.

A second visit in the same profile: the preload's 76 downloads do not repeat, but the Phaser pass's loads, 87 responses in all, are network responses: none came from the disk cache, none from a service worker, and no service worker is registered on the dev origin (`navigator.serviceWorker.getRegistrations()` is empty). So on dev the second visit still makes network requests for the held objects, and the scenario "A second visit downloads nothing" is not met there. The cache-first worker that would answer them is `architecture-hosted-assets` task 5.1's to verify.

## 6.3: the client bundle before and after

`pnpm -C apps/web build` on the parent commit of the loader change (`178c16f21e^`, in a detached worktree with its own install and packages) and on this tree. The client output is "apps/web/.output/public":

- Before: 41,285,843 bytes (39.37 MiB), of which media 13,815,527 bytes (13.18 MiB), JS and CSS 17,814,718 bytes (16.99 MiB).
- After: 30,391,195 bytes (28.98 MiB), of which media 2,963,830 bytes (2.83 MiB), JS and CSS 17,786,725 bytes (16.96 MiB).

The second total is smaller by 10,894,648 bytes (10.39 MiB). The media fell by 10,851,697 bytes, which is 99.6% of that drop, and the JS and CSS and the rest moved by 42,951 bytes together. The workspace's bundle record is written by the review of `ai/queue`, as its design says, so this change commits no record.
