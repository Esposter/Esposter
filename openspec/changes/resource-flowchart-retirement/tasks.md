## 1. Before the release

- [ ] 1.1 Wait for the whiteboard change to ship and archive. Verify: its proposal sits under `openspec/changes/archive` and its whiteboard is in the app.
- [ ] 1.2 Settle each open row of the feature check in the design (node resize minimum, connector ports, path types, minimap, the read-only publish loss, the achievement loss, export without an open editor, the grid, delete by keyboard). Verify: every row in the design's table reads covered, or is decided.
- [ ] 1.3 Write the one-time purge, a function in `apps/functions/src/services/resource` in the style of the cutover's one-time run: for each Flowchart row it calls `purgeResource`, then `broadcastStorageUsage` with the owners returned. Verify: a test in `apps/functions` shows that after the run, a flowchart's blob directory, its storage ledger entries and its row are gone, and that a purge which fails leaves its row in place as the retry marker.

## 2. The one-time purge

- [ ] 2.1 Run the one-time purge once against each environment, from the current release, before the removal release ships. Verify: the count of Flowchart rows reads zero, a listing of each former flowchart's blob prefix is empty, and no storage ledger entry names a flowchart resource.

## 3. The removal release

- [ ] 3.1 Remove the Flowchart type: its resource type value, definition, dispatch entry, router, procedure input, class map entry, blade, editor, view, dialogs, export and portable entries, and every component, composable, store, service and model the design lists. Verify: a search of `apps` and `packages` source for `ResourceType.Flowchart`, `FlowchartEditor` and `flowchartEditor` finds nothing outside migrations.
- [ ] 3.2 Remove the Flowcharter achievement name and the Flowchart achievement category. Verify: a search of source finds no `FlowchartAchievementName` and no `AchievementCategory.Flowchart`.
- [ ] 3.3 Remove the five `@vue-flow` packages from `apps/web/package.json` and `pnpm-workspace.yaml`, refresh `pnpm-lock.yaml` through `pnpm i`, and remove their stylesheet imports and their ledger rows. Verify: a search of source for `@vue-flow` finds nothing, and `.agents/ledgers/dependencies.md` has no Vue Flow row.
- [ ] 3.4 Write the removal migration under the drizzle skill: delete any row still referencing a Flowchart resource and any Flowcharter achievement rows, then drop the Flowchart resource type value and the Flowcharter achievement value. It refuses to run while any Flowchart row remains. Verify: a test in `packages/db-schema` shows the migration fails on a database holding one Flowchart row and succeeds on one holding none, and that the enum no longer lists the Flowchart value.
- [ ] 3.5 Run the release's bundle measurement against the last release before it, and record the client bytes Vue Flow no longer adds in the change's proposal. Verify: the measurement is recorded beside the release's commit, with the score's date.

## 4. Specs and sweep

- [ ] 4.1 Write REMOVED deltas for `resource/flowchart-connectors`, `resource/flowchart-image-export` and `resource/flowchart-publish`, and archive this change. Verify: `pnpm exec openspec validate resource-flowchart-retirement --strict --no-interactive` passes, and the three capability folders are gone from `openspec/specs`.
- [ ] 4.2 Sweep the prose: search `openspec` outside `archive`, `.agents/skills` and `.agents/ledgers` for `flowchart`, `Vue Flow` and `vue-flow`, and fix each hit in the release's commit. The deferred flowchart page is closed with a line naming this change. Verify: the search finds no hit except archived history and that closing line.
- [ ] 4.3 Remove the flowchart shapes line from the resource roadmap, and link this change in its place. Verify: `openspec/changes/resource-roadmap/tasks.md` links this change and nothing about flowchart shapes.
