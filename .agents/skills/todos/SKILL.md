---
name: todos
description: Apply when writing, reading or removing an `@TODO`, when a workaround waits on something outside the repo, or when a bump or a closed issue may have ended one. Esposter's `@TODO` convention — a marker exists only for a workaround something external forces, never a note-to-self or deferred work of our own; it is followed by the link to the thing that ends it (an upstream issue, a webstatus.dev feature, a release), or says no upstream issue exists yet and is listed until one is filed, and sits on the workaround itself; and it is revisited on every bump of the linked package and whenever the linked issue closes.
---

# TODOs

An `@TODO` marks a workaround the repository carries because something outside it is not ready yet — an upstream bug, a browser feature, a dependency's release. It is the one comment that states a future, and it may only because the future belongs to someone else and a link says how to know it arrived.

## Settled — do not re-propose

- **A TODO for our own work** — "retirement removes this", "until the actions name meanings", "clean up once X is migrated". Work of ours is done in the change that finds it, or it is a GitHub issue (`.agents/issue-tracker.md`) or a proposal (`docs` skill). A marker for it is a finding to fix now, never a line to reword.
- **A TODO linking one of our own issues.** Same thing with a URL on it: the issue is the record, and the code carries no marker for it.
- **A condition in words in place of the link** — "once nuxt fixes its types", "in nitro v3". Nobody can check it, so it reads the same the day the condition is met as the day it was written; the link is what a later reader opens to find out.

## The form

The marker is followed by the link and nothing else first — `scripts/src/workspace/todos.test.ts` fails any tracked file, prose aside, where it is not:

- `// @TODO: <link>` in TypeScript and a `<script>` block, `<!-- @TODO: <link> -->` in a template, `# @TODO: <link>` in YAML.
- `package.json` has no comments: the `scriptsComments` string is the `package-scripts` skill's (`references/scripts-comments.md`), in this same form.

**The link is the thing whose resolution ends the workaround** — the upstream issue or pull request, the `webstatus.dev` feature, the release. A search result, a discussion that tracks nothing or a docs page does not end anything. When no issue exists yet, one is filed upstream before the marker is written, and a limitation upstream closes as won't-fix or documents as intended is no longer a TODO: the workaround is permanent, so it keeps a plain comment saying why, and that comment may cite the upstream record.

**When no issue exists yet and none is filed now**, the marker says so in place of the link — `// @TODO: no upstream issue — <what waits, and on whom>` — and its file is listed under "Unfiled upstream issues" below with the repository to file against, so the reminder to file one lives in one place. `scripts/src/workspace/todos.test.ts` holds that list to the tree both ways. Once filed, the marker takes the link and the row goes.

**What to remove follows the link, in one clause, when it is not obvious** — `— drop getSynchronizedFunction once Nitro awaits its plugins`. A marker over a single-purpose line (`// @TODO: https://github.com/vuejs/core/issues/11371` on a `Props` the compiler cannot resolve yet) needs no clause: the line under it is what goes.

## Where it sits

On the workaround itself — the line, block or file the fix deletes — as an own-line comment above it with the placement rules of the `formatting` skill ("Comments"). A workaround spanning a file carries it as the file's first line. The same marker repeated at every site of one upstream bug is deliberate: each site is simplified in place the day it can be, so the repetition is not a duplicate to collapse.

## When to revisit

- **Every bump of the package the link names.** The release notes are read against every marker linking it (`git grep -n "@TODO: <repository url>"`), and a workaround the new version makes redundant is removed in the bump's own commit — the `dependency-updates` skill's features read (`references/major-upgrades.md`, "Read the features list") is where a major does this, and a minor that closes the issue owes the same.
- **Whenever the linked issue closes.** `gh issue view <url> --json state` answers it. Closed and released in the version the catalog resolves (`pnpm-workspace.yaml`, then `pnpm-lock.yaml`): remove the workaround and the marker, and run the touched tests. Closed but not yet released in that version: it stays, and nothing changes until the bump that takes the fix.

## Unfiled upstream issues

Each row is a marker in the unfiled form, waiting for its issue to be filed: the file, where it goes, and its title.

- `apps/web/app/components/Ui/Slider.vue` — vuetifyjs/0: "Slider: `end` is emitted only on pointerup, never for a keyboard change"
- `apps/web/app/components/Message/Model/FileRenderer/Pdf.vue` — vue-pdf-viewer: "Menus and popovers portal to `body`, unusable inside a modal `<dialog>`"
- `apps/web/shared/types/nuxt.d.ts` — nuxt/nuxt: "The server project types neither `import.meta.env` for `shared/` code nor a module's Nitro runtime hooks"
