## 1. Owner confirmations, before anything is deleted

- [ ] 1.1 Read the Flowchart row count and the Flowcharter achievement row count from each environment's database, and record each count with its read date in the owner's confirmation. Verify: the record holds one count per environment, and the owner confirms each one in writing.
- [ ] 1.2 Settle each open row of the feature check in the design (node resize minimum, connector ports, path types, minimap, the read-only publish loss, the achievement loss, export without an open editor, the grid, delete by keyboard). Verify: every row in the design's table reads covered, or confirmed as a loss by the owner.
- [ ] 1.3 Wait for the design canvas change to ship and archive. Verify: its proposal sits under `openspec/changes/archive` and its whiteboard is in the app.

## 2. Mark the rows

- [ ] 2.1 Write the marking data migration under the backfills skill, setting the deleted timestamp on every Flowchart row past the recycle bin's window. Verify: the marked rows equal the confirmed Flowchart count for that environment, and every one is past the window.
- [ ] 2.2 Let the nightly purge run. Verify: the Flowchart row count reads zero, no blob of a Flowchart row remains in the blob store, and each owner's storage count no longer includes them, as the purge's own test in `apps/functions` shows.

## 3. The release: remove the type and Vue Flow together

- [ ] 3.1 Remove the Flowchart type: its resource type value, definition, dispatch entry, router, procedure input, class map entry, blade, editor, view, dialogs, export and portable entries, and every component, composable, store, service and model the design lists. Verify: a search of `apps` and `packages` source for `ResourceType.Flowchart`, `FlowchartEditor` and `flowchartEditor` finds nothing outside migrations.
- [ ] 3.2 Remove the Flowcharter achievement name and the Flowchart achievement category. Verify: a search of source finds no `FlowchartAchievementName` and no `AchievementCategory.Flowchart`.
- [ ] 3.3 Remove the five `@vue-flow` packages from `apps/web/package.json` and `pnpm-workspace.yaml`, refresh `pnpm-lock.yaml` through `pnpm i`, and remove their stylesheet imports and their ledger rows. Verify: a search of source for `@vue-flow` finds nothing, and `.agents/ledgers/dependencies.md` has no Vue Flow row.
- [ ] 3.4 Write the release migration under the drizzle skill, dropping the Flowchart resource type value and the Flowcharter achievement value, and deleting the achievement rows that name it. It refuses to run while any Flowchart row remains. Verify: the migration fails on a database holding one Flowchart row and succeeds on one holding none, shown by a test in `packages/db-schema`.
- [ ] 3.5 Run the release's bundle measurement against the last release before it, and record the client bytes Vue Flow no longer adds in the change's proposal. Verify: the measurement is recorded beside the release's commit, with the score's date.

## 4. Specs and sweep

- [ ] 4.1 Write REMOVED deltas for `resource/flowchart-connectors`, `resource/flowchart-image-export` and `resource/flowchart-publish`, and archive this change. Verify: `pnpm exec openspec validate resource-flowchart-retirement --strict --no-interactive` passes, and the three capability folders are gone from `openspec/specs`.
- [ ] 4.2 Sweep the prose: search `openspec` outside `archive`, `.agents/skills` and `.agents/ledgers` for `flowchart`, `Vue Flow` and `vue-flow`, and fix each hit in the release's commit. The deferred flowchart page is closed with a line naming this change. Verify: the search finds no hit except archived history and that closing line.
- [ ] 4.3 Remove the flowchart shapes line from the resource roadmap, and link this change in its place. Verify: `openspec/changes/resource-roadmap/tasks.md` links this change and nothing about flowchart shapes.
