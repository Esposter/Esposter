## 1. Measure

- [ ] 1.1 Run `pnpm ai:dependencies:score --analyze --sort bundle` and record the gzipped client bytes of `@vue-flow/core`, its four plugins and their d3 dependencies in this change's design, in place of the aggregator figures. Verify: the score prints a row with a gzipped size and an entry-chunk share for each package, and the design quotes those numbers with the date of the run.

## 2. The shared models own their enums

- [ ] 2.1 Define the path-type and arrowhead enums in the shared flowchart model with the engine's string values, and point `GraphEdge` and its schema at them. Verify: `apps/web/shared/models/flowchartEditor/data/FlowchartEditor.test.ts` passes with only its import line changed, and a saved flowchart with each stored path type still parses.
- [ ] 2.2 Replace the engine's type imports in `GraphNode.ts` and `XYPosition.ts` with the model's own types. Verify: no file under `apps/web/shared` imports `@vue-flow`, shown by a search in the PR, and CI's typecheck passes on the push.

## 3. The background and the controls

- [ ] 3.1 Draw the background dot grid as an app component and mount it in the editor, the published view and the export. Verify: the existing export scenarios 'The export uses the current theme's background' and 'A dark theme export has a dark background' still pass, and the export has no dot grid.
- [ ] 3.2 Rewrite the zoom controls over the engine's instance. Verify: a test named 'zoom in raises the zoom by one step', beside the controls component, passes.

## 4. The minimap

- [ ] 4.1 Draw the minimap as an app component used by the editor and the published view. Verify: a test named 'the minimap draws one rectangle per node' passes, and the scenarios in `openspec/specs/resource/flowchart-publish/spec.md` still pass.

## 5. The node resizer

- [ ] 5.1 Write a pointer resize to the node's width and height in its style, clamped at the Rectangle node's minimum of 120 by 60. Verify: a test named 'a resize below the minimum stops at 120 by 60' in `apps/web/app/components/FlowchartEditor/Node/Rectangle.test.ts` passes.
- [ ] 5.2 Settle the keyboard path for resize, open choice 2 in the proposal, and record the owner's choice in the proposal before this task closes. Verify: the proposal names the choice, and the resizer's behaviour matches it.

## 6. Remove the plugin packages

- [ ] 6.1 In the same commit that removes the last plugin import, delete the four plugin dependencies from `apps/web/package.json` and `pnpm-workspace.yaml`, refresh the lockfile through `pnpm i`, and delete their four `Keep — hold` rows from `.agents/ledgers/dependencies.md`. Verify: a search of `apps` and `packages` source for `@vue-flow/background`, `@vue-flow/controls`, `@vue-flow/minimap` and `@vue-flow/node-resizer` finds nothing, and the ledger has no row for them.

## 7. Close the decision

- [ ] 7.1 Once the owner accepts option 1, record the outcome in the deferred page's revisit section, and remove the waiting clause from `resource-flowchart-shapes` and the roadmap line that links the deferred page, pointing both at this change instead. Verify: a search of `openspec` outside `archive` finds no link to the deferred page for its revisit, and the spec tests in `scripts` pass (`pnpm -C scripts exec vitest run src/services/openspec`).
