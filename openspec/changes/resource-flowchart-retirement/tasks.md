## 1. Before the release

- [ ] 1.1 Wait for the whiteboard change to ship and archive. Verify: its proposal sits under `openspec/changes/archive` and its whiteboard is in the app.
- [ ] 1.2 Settle each open row of the feature check in the design (node resize minimum, connector ports, path types, minimap, the read-only publish loss, the achievement loss, export without an open editor, the grid, delete by keyboard). Verify: every row in the design's table reads covered, or is decided.

## 2. The release: remove the type, Vue Flow and the stored flowcharts together

- [ ] 2.1 Remove the Flowchart type: its resource type value, definition, dispatch entry, router, procedure input, class map entry, blade, editor, view, dialogs, export and portable entries, and every component, composable, store, service and model the design lists. Verify: a search of `apps` and `packages` source for `ResourceType.Flowchart`, `FlowchartEditor` and `flowchartEditor` finds nothing outside migrations.
- [ ] 2.2 Remove the Flowcharter achievement name and the Flowchart achievement category. Verify: a search of source finds no `FlowchartAchievementName` and no `AchievementCategory.Flowchart`.
- [ ] 2.3 Remove the five `@vue-flow` packages from `apps/web/package.json` and `pnpm-workspace.yaml`, refresh `pnpm-lock.yaml` through `pnpm i`, and remove their stylesheet imports and their ledger rows. Verify: a search of source for `@vue-flow` finds nothing, and `.agents/ledgers/dependencies.md` has no Vue Flow row.
- [ ] 2.4 Write the deletion migration under the drizzle skill: delete every Flowchart resource row, every row that references one, and the Flowcharter achievement rows, then drop the Flowchart resource type value and the Flowcharter achievement value. Verify: a test in `packages/db-schema` shows the migration leaves no Flowchart row, no referencing row and no achievement row, and the enum no longer lists the Flowchart value.
- [ ] 2.5 Run the release's bundle measurement against the last release before it, and record the client bytes Vue Flow no longer adds in the change's proposal. Verify: the measurement is recorded beside the release's commit, with the score's date.

## 3. Specs and sweep

- [ ] 3.1 Write REMOVED deltas for `resource/flowchart-connectors`, `resource/flowchart-image-export` and `resource/flowchart-publish`, and archive this change. Verify: `pnpm exec openspec validate resource-flowchart-retirement --strict --no-interactive` passes, and the three capability folders are gone from `openspec/specs`.
- [ ] 3.2 Sweep the prose: search `openspec` outside `archive`, `.agents/skills` and `.agents/ledgers` for `flowchart`, `Vue Flow` and `vue-flow`, and fix each hit in the release's commit. The deferred flowchart page is closed with a line naming this change. Verify: the search finds no hit except archived history and that closing line.
- [ ] 3.3 Remove the flowchart shapes line from the resource roadmap, and link this change in its place. Verify: `openspec/changes/resource-roadmap/tasks.md` links this change and nothing about flowchart shapes.
