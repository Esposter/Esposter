## 1. Before the release

- [x] 1.1 Wait for the whiteboard change to ship and archive. Verify: its proposal sits under `openspec/changes/archive` and its whiteboard is in the app.
- [x] 1.2 Check each row of the feature check in the design against the whiteboard's features table, and confirm the built whiteboard covers each row it marks covered. Verify: every row reads covered, or is one of the drops the design names.

## 2. The one-time purge

- [x] 2.1 Run the one-time purge once against each environment, from the current release, before the removal release ships. It is a throwaway script the session runs, not repo code (the `backfills` skill): for each Flowchart row it calls `purgeResourceAndBroadcast`, as the timer's purge does for an expired one, then counts the rows left. Verify: the count of Flowchart rows reads zero, a listing of each former flowchart's blob prefix is empty, and no storage ledger entry names a flowchart resource.

## 3. The removal release

- [x] 3.1 Remove the Flowchart type: its resource type value, definition, dispatch entry, router, procedure input, class map entry, blade, editor, view, dialogs, export and portable entries, and every component, composable, store, service and model the design lists. Verify: a search of `apps` and `packages` source for `ResourceType.Flowchart`, `FlowchartEditor` and `flowchartEditor` finds nothing outside migrations.
- [x] 3.2 Remove the Flowcharter achievement name and the Flowchart achievement category. Verify: a search of source finds no `FlowchartAchievementName` and no `AchievementCategory.Flowchart`.
- [x] 3.3 Remove the five `@vue-flow` packages from `apps/web/package.json` and `pnpm-workspace.yaml`, refresh `pnpm-lock.yaml` through `pnpm i`, and remove their stylesheet imports and their ledger rows. Verify: a search of source for `@vue-flow` finds nothing, and `.agents/ledgers/dependencies.md` has no Vue Flow row.
- [x] 3.4 Write the removal migration under the drizzle skill: delete any row still referencing a Flowchart resource and any Flowcharter achievement rows, then drop the Flowchart resource type value and the Flowcharter achievement value. It refuses to run while any Flowchart row remains. Verify: the refusal is a guard in the migration's own SQL and its run's output is the evidence, with no test of a one-time migration (the `testing` skill, `references/what-earns-a-test.md`).
- [x] 3.5 Run the release's bundle measurement against the last release before it, and record the client bytes Vue Flow no longer adds in the change's proposal. Verify: the measurement is recorded in the proposal under Bundle measurement. (Recorded as the packages' built size, a ceiling: the app bundle is ungated and a local app build is not run.)

## 4. Specs and sweep

- [x] 4.1 Write REMOVED deltas for `resource/flowchart-connectors`, `resource/flowchart-image-export` and `resource/flowchart-publish`, and archive this change. Verify: `pnpm exec openspec validate resource-flowchart-retirement --strict --no-interactive` passes, and the three capability folders are gone from `openspec/specs`.
- [x] 4.2 Sweep the prose: search `openspec` outside `archive`, `.agents/skills` and `.agents/ledgers` for `flowchart`, `Vue Flow` and `vue-flow`, and fix each hit in the release's commit. The deferred flowchart page is closed with a line naming this change. Verify: the search finds no hit except archived history and that closing line.
- [x] 4.3 Remove the flowchart shapes line from the resource roadmap, and link this change in its place. Verify: `openspec/changes/resource-roadmap/tasks.md` links this change and nothing about flowchart shapes.
