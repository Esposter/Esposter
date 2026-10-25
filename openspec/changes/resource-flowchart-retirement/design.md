# Flowchart Retirement

This change removes the Flowchart type, its canvas dependency and every stored flowchart, in one release. [The proposal](proposal.md) records the owner's decisions. This page holds the deletion, the check that the whiteboard covers the flowchart's work, and the files the removal touches.

## The deletion

The removal runs in two steps, each its own deployment, and the purge does the work that needs the old code.

1. **The one-time purge, run by the current release before the removal ships.** A one-time function in `apps/functions`, written in the style of the cutover's one-time run, takes every Flowchart row and calls `purgeResource` for it, then `broadcastStorageUsage` with the owners it returns, which are the two calls the timer's per-resource body makes. The Flowchart owns no table partitions (its entry in the resource-owned tables map is empty), so its table client list is empty. Its verification is a count of Flowchart rows that reads zero, and a listing of each flowchart's blob prefix that is empty.
2. **The removal release.** The code that names the type is removed, and a migration runs at app startup, where the new code never reads a flowchart row. It deletes any row still referencing a flowchart resource, found through the drizzle skill's listing of the foreign keys to the resources table, and any Flowcharter achievement rows, then drops the Flowchart resource type value and the Flowcharter achievement value. It refuses to run while any Flowchart row remains. A PostgreSQL enum value cannot be dropped while a row still holds it, which is why the purge comes first.

### The ordering rule

A blob is deleted only inside the purge of its own resource, together with that resource's row, and never in a step of its own ahead of that row. `purgeResource` runs its steps in one fixed order: the blob directory, then the table partitions, then the storage ledger entries for the directory, then the row. The directory goes before the row because the row is the durable marker: if any step fails, the row survives, and the next run replays the whole sequence, where already-gone deletes count as success. That retry order is the only ordering the removal relies on, and no step in it deletes blobs apart from the purge of their row.

## The whiteboard covers the feature list

Nothing is dropped unnoticed: each feature the Flowchart has is checked against the whiteboard's [gap analysis](../resource-whiteboard/design.md#gap-analysis), which succeeds it. Each row below ends as covered, as a change the whiteboard names, or as one of the drops the owner decided: the minimap, the read-only published view and the achievement. A row left open blocks the release.

| Flowchart feature                                 | Whiteboard row, in its gap analysis                              | Status                                         |
| ------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| Labelled step nodes                               | Node label                                                       | Covered                                        |
| Node colour                                       | Node colour                                                      | Covered                                        |
| Node resize with a minimum size                   | Node resize, with a minimum for each shape                       | Covered                                        |
| Four connection points per node, loose connection | Connection points, and connector binds to shapes with a free end | Covered                                        |
| Arrowhead on every connector                      | Connector and arrowhead, with arrowheads at either end           | Covered, changed: both ends                    |
| Connector labels, edited inline                   | Edge label                                                       | Covered                                        |
| Curved, right-angled and straight paths           | Path kinds, and right-angled routing                             | Covered                                        |
| Palette of node types, dropped on the canvas      | Palette, placed by drag or by click                              | Covered, changed: no native drag and drop      |
| Minimap                                           | MiniMap                                                          | Dropped, by the owner's decision               |
| Dot grid and snap to grid                         | Background grid and snap                                         | Covered                                        |
| Pan, zoom and fit                                 | Pan and zoom, and zoom and fit controls                          | Covered                                        |
| Delete by keyboard                                | Keyboard                                                         | Covered, extended                              |
| Export to PNG and SVG, fonts and theme background | Export PNG and SVG, and export background and fonts              | Covered, changed: drawn from the model         |
| Read-only published view                          | Read-only published view                                         | Deferred, by the owner's decision              |
| Agent reads and patches of flowchart content      | Agent tools                                                      | Covered, extended with the typed move          |
| Flowchart achievement                             | Earned achievement                                               | Removed with the type, by the owner's decision |

## Scope of the removal

Each file below is removed or has its entry removed in the release. The paths are the ones that name the type, its canvas, its dependency or its agent surface; the sweep in the tasks finds the rest.

| File                                                                    | Role in the removal                                                                             |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/models/resource/ResourceType.ts`                | Drops the Flowchart value                                                                       |
| `packages/db-schema/src/services/resource/ResourceOwnedTablesMap.ts`    | Drops the Flowchart entry                                                                       |
| `packages/db-schema/src/schema/resource/resourcesInResource.ts`         | The resource type enum column the migration drops a value from                                  |
| `packages/db-schema/src/models/achievement/FlowchartAchievementName.ts` | Deleted with the achievement                                                                    |
| `packages/db-schema/src/services/achievement/AchievementName.ts`        | Drops the achievement from the name union                                                       |
| `apps/web/shared/models/achievement/AchievementCategory.ts`             | Drops the Flowchart category                                                                    |
| `apps/web/shared/models/flowchartEditor`                                | Deleted: the graph's models and their tests                                                     |
| `apps/web/shared/models/trpc/TRPCProcedureInputs.ts`                    | Drops the flowchart save input                                                                  |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`            | Drops the Flowchart definition                                                                  |
| `apps/web/shared/services/superjson/JSONClassMap.ts`                    | Drops the flowchart classes                                                                     |
| `apps/web/server/trpc/routers/flowchart.ts`                             | Deleted: the flowchart router                                                                   |
| `apps/web/server/trpc/routers/index.ts`                                 | Drops the flowchart router                                                                      |
| `apps/web/server/trpc/routers/resourceDispatch.ts`                      | Drops the flowchart dispatch entry                                                              |
| `apps/web/app/components/Resource/Flowchart`                            | Deleted: editor, published view, dialogs and export canvas                                      |
| `apps/web/app/components/FlowchartEditor`                               | Deleted: nodes, edges, panels and the sidebar                                                   |
| `apps/web/app/services/flowchartEditor`                                 | Deleted: node and edge maps, path functions and constants                                       |
| `apps/web/app/composables/flowchartEditor`                              | Deleted: drag and drop                                                                          |
| `apps/web/app/store/flowchartEditor`                                    | Deleted: the editor and export stores                                                           |
| `apps/web/app/services/resource/flowchart`                              | Deleted: the export capture and its SVG rasterizing                                             |
| `apps/web/app/models/resource/FlowchartExportRequest.ts`                | Deleted                                                                                         |
| `apps/web/app/models/resource/FlowchartExportFormat.ts`                 | Deleted                                                                                         |
| `apps/web/app/services/resource/PortableFormatMap.ts`                   | Drops the flowchart formats                                                                     |
| `apps/web/app/services/resource/ResourceBladeDefinitionMap.ts`          | Drops the entry                                                                                 |
| `apps/web/app/services/resource/ResourceDialogsComponentMap.ts`         | Drops the entry                                                                                 |
| `apps/web/app/services/resource/ResourceEditorComponentMap.ts`          | Drops the entry                                                                                 |
| `apps/web/app/services/resource/ResourceTypeDescriptionMap.ts`          | Drops the entry                                                                                 |
| `apps/web/app/services/resource/ViewComponentMap.ts`                    | Drops the published view entry                                                                  |
| `apps/web/package.json`                                                 | Drops the five `@vue-flow` dependencies                                                         |
| `pnpm-workspace.yaml`                                                   | Drops the five catalog entries                                                                  |
| `pnpm-lock.yaml`                                                        | Regenerated by `pnpm i`, without the Vue Flow packages                                          |
| `.agents/ledgers/dependencies.md`                                       | Drops the Vue Flow rows, with their last import                                                 |
| `.agents/ledgers/quality/shared.md`                                     | Drops the flowchart editor row                                                                  |
| `packages/db/src/services/resource/purgeResource.ts`                    | The per-resource purge the one-time run calls: blob directory, partitions, ledger, then the row |
| `apps/functions/src/services/resource/purgeExpiredResources.ts`         | The timer's per-resource body, whose two calls the one-time run repeats                         |
| `openspec/specs/resource/README.md`                                     | Drops the three flowchart capabilities from the index                                           |
| `openspec/specs/architecture/agent-content-tools/design.md`             | Drops its flowchart rows                                                                        |
| `openspec/changes/resource-roadmap/tasks.md`                            | Drops the flowchart shapes line, and links this change                                          |

## Specs

This change writes no spec delta now. Its removal is recorded as REMOVED requirements in the three flowchart capabilities when the change is built, since the requirement names are read from those specs then. The capabilities are `openspec/specs/resource/flowchart-connectors`, `flowchart-image-export` and `flowchart-publish`, and the archive deletes their folders.

## Sources

- [Flowchart on the editor core](../../deferred/resource/flowchart-on-editor-core/design.md): the removal future, and the rule that a resource type leaves PostgreSQL only once no row holds it.
- [Whiteboard](../resource-whiteboard/design.md#gap-analysis): the gap analysis the feature check reads.
- [Purge a resource](../../../apps/functions/src/services/resource/purgePreCutoverResources.ts): the cutover's one-time run, the precedent the one-time purge follows.
