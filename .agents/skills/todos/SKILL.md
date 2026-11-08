---
name: todos
description: Apply when writing, reading or removing an `@TODO`, when a workaround waits on something outside the repo, when a fix belongs in another project's repository, or when a bump or a closed issue may have ended one. Esposter's `@TODO` convention — a marker only for a workaround something external forces.
---

# TODOs

An `@TODO` marks a workaround the repository carries because something outside it is not ready yet — an upstream bug, a browser feature, a dependency's release. It is the one comment that states a future, and it is written only because the future belongs to someone else and a link says how to know it arrived.

## Settled — do not re-propose

- **A TODO for our own work** — "retirement removes this", "until the actions name meanings", "clean up once X is migrated". Work of ours is done in the change that finds it, or it is a GitHub issue (`.agents/issue-tracker.md`) or a proposal (the `openspec` skill, `references/page-shapes.md`). A marker for it is a finding to fix now, never a line to reword.
- **A TODO linking one of our own issues.** The issue is the record, and the code carries no marker for it.
- **A pull request to another project's repository, or a fork made for one.** Each one spends a maintainer's review time on a change they never asked for, and for now we keep that cost off them, even when the ask is to fix the gap. A gap only upstream can close goes to the user as its cause, the fix and the evidence. In the repo, it waits as a marker on the upstream record when a workaround is carried, or in the unfiled form when no record exists. Filing an issue stays the owner's, by hand ("Unfiled upstream issues"). The report the owner files is drafted as `references/upstream-reports.md` says.
- **A condition in words in place of the link** — "once nuxt fixes its types", "in nitro v3". Nobody can check it, so it reads the same the day the condition is met as the day it was written; the link is what a later reader opens to find out.

## The form

The marker is followed by the link and nothing else first — `scripts/src/workspace/todos.test.ts` fails any tracked file, prose aside, where it is not:

- `// @TODO: <link>` in TypeScript and a `<script>` block, `<!-- @TODO: <link> -->` in a template, `# @TODO: <link>` in YAML.
- `package.json` has no comments: the `"scriptsComments"` string is the `package-scripts` skill's (`references/scripts-comments.md`), in this same form.

**The link is the thing whose resolution ends the workaround** — the upstream issue or pull request, the `webstatus.dev` feature, the release. A search result, a discussion that tracks nothing or a docs page does not end anything. When no issue exists yet, one is filed upstream before the marker is written, and a limitation upstream closes as won't-fix or documents as intended is no longer a TODO: the workaround is permanent, so it keeps a plain comment saying why, and that comment may cite the upstream record.

**When no issue exists yet and none is filed now**, the marker says so in place of the link — `// @TODO: no upstream issue — <what waits, and on whom>` — and its file is listed under "Unfiled upstream issues", on this page, with the repository to file against, so the reminder to file one lives in one place. `scripts/src/workspace/todos.test.ts` holds that list to the tree both ways. Once filed, the marker takes the link and the row goes.

**What to remove follows the link, in one clause, when it is not obvious** — `— drop getSynchronizedFunction once Nitro awaits its plugins`. A marker over a single-purpose line (`// @TODO: https://github.com/vuejs/core/issues/11371` on a `Props` the compiler cannot resolve yet) needs no clause: the line under it is what goes.

## Where it sits

On the workaround itself — the line, block or file the fix deletes — as an own-line comment above it with the placement rules of the `formatting` skill ("Comments"). A workaround spanning a file carries it as the file's first line. The same marker repeated at every site of one upstream bug is deliberate: each site is simplified in place the day it can be, so the repetition is not a duplicate to collapse.

## When to revisit

A marker is revisited on every bump of the package it links and whenever its issue closes; the workaround and its marker are removed in that commit once the fix is released in the resolved version (`references/revisiting.md`).

## Reference pages

- `references/revisiting.md` — when bumping a package a marker links, or a linked issue may have closed.
- `references/upstream-reports.md` — when a gap only upstream can close is written up as a report for the owner to file: the proof steps, the section order and the plain-language rules.

## Unfiled upstream issues

Each row is a marker in the unfiled form, waiting for its issue to be filed: the file, where it goes, and its title. The repository's owner files them by hand when one is wanted, so a session leaves the list as it is and never asks to file one.

- `apps/web/app/components/Ui/Slider.vue` — vuetifyjs/0: "Slider: `end` is emitted only on pointerup, never for a keyboard change"
- `apps/web/app/services/trpc/mswTrpc.test.ts` — nuxt/test-utils: "In the nuxt environment `fetch` and `Request` are happy-dom's while `Headers` stays Node's, so a library mixing the globals (msw 3) loses requests and headers"
- `apps/web/app/composables/auth/useAuthSession.ts` — better-auth/better-auth: "Vue client: `useSession(useFetch)` no longer typechecks on Nuxt 5, whose `useFetch` overloads are generic over the route"
- `apps/web/modules/servePublicDirectory.ts` — nuxt/nuxt: "With `nitroViteEnvironment`, `nuxt dev` runs Vite's transform on every script in `public/`, serving it as a module exporting its own URL"
- `pnpm-workspace.yaml` — nitrojs/nitro: "A storage mount's unstorage fs driver loads `chokidar`, which nothing declares"; nuxt/nuxt: "`@nuxt/nitro-server` aliases `bufferutil` to the bare `mocked-exports/proxy`, which Nitro 3 resolves from the app"
- `knip.config.ts` — the same nitrojs/nitro and nuxt/nuxt issues as `pnpm-workspace.yaml`'s row, on the app's `ignoreDependencies` entries for the packages they leave nothing in the app importing, and nuxt/scripts' `lru-cache`, which its storage driver loads undeclared
- `packages/vue-pdfjs-headless/src/composables/usePdfViewer.ts` — mozilla/pdf.js: "`PDFViewerOptions` omits `abortSignal`, which `PDFViewer`'s constructor reads to end its resize observer and scroll listener"
- `packages/trpc-msw/src/createTRPCMsw.ts` — trpc/trpc: "`applyWSSHandler` types `wss` as the whole `ws.WebSocketServer` though it reads only `on` and `clients`, so a server that is not a `ws` one needs a cast"
- `packages/trpc-nuxt-module/src/runtime/server/createTRPCWebSocketHandler.ts` — trpc/trpc: "`applyWSSHandler` types `wss` as the whole `ws.WebSocketServer` though it reads only `on` and `clients`, so a server that is not a `ws` one needs a cast"
