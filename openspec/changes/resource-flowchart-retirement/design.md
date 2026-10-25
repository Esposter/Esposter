# Flowchart Retirement

This change removes the Flowchart type, its canvas dependency and every stored flowchart, in one release. [The proposal](proposal.md) records the owner's decisions. This page holds the deletion, the check that the whiteboard covers the flowchart's work, and the files the removal touches.

## The deletion

The release deletes the rows in one migration, and the code that names the type is removed in the same release. Migrations run at app startup, so the new code never reads a flowchart row. The migration runs these steps in order:

1. Delete every resource row of the Flowchart type.
2. Delete every row that references one of those resources, found through the drizzle skill's listing of the foreign keys to the resources table.
3. Delete the Flowcharter achievement rows.
4. Drop the Flowchart resource type value and the Flowcharter achievement value.

A PostgreSQL enum value cannot be dropped while a row still holds it, which is why the rows go first. The migration deletes rows, not blobs. Each flowchart's content blob, and the storage it counted against its owner, stay where they are: the nightly purge reaches only rows past the recycle bin's window, and this deletion does not pass through that window. Removing those blobs is not part of this change.

## The whiteboard covers the feature list

Nothing is dropped unnoticed: each feature the Flowchart has is checked against the [whiteboard](../resource-whiteboard/design.md), which succeeds it, and each row ends as covered or as a loss decided before the release. A row left open blocks the release.

| Flowchart feature                                 | Whiteboard counterpart                                                 | Status                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Labelled step nodes                               | Shapes with text bound to their container                              | Covered                                                    |
| Node colour                                       | Element fill and stroke                                                | Covered                                                    |
| Node resize with a minimum size                   | Free resize with no minimum                                            | Decide before release                                      |
| Four connection points per node, loose connection | Arrows bound to a shape, with no fixed points                          | Decide before release                                      |
| Arrowhead on every connector                      | Arrow end head                                                         | Covered; verify in the whiteboard's build                  |
| Connector labels, edited inline                   | Text bound to an arrow                                                 | Covered; verify                                            |
| Curved, right-angled and straight paths           | The whiteboard's arrow kinds                                           | Decide before release                                      |
| Palette of node types, dropped on the canvas      | The whiteboard's toolbar                                               | Covered                                                    |
| Minimap                                           | None in the whiteboard                                                 | Decide before release: dropped, or added to the whiteboard |
| Dot grid and snap to grid                         | The whiteboard's grid                                                  | Verify                                                     |
| Pan, zoom and fit                                 | The whiteboard's viewport                                              | Covered                                                    |
| Delete by keyboard                                | The whiteboard's shortcuts                                             | Verify                                                     |
| Export to PNG and SVG, fonts and theme background | The Portable formats, from stored elements                             | Covered; verify export without an open editor              |
| Read-only published view                          | None: publishing is not in the whiteboard's first version              | Decide the loss before release                             |
| Agent reads and patches of flowchart content      | The whiteboard's content schema, read and patched by the generic tools | Covered                                                    |
| Flowchart achievement                             | Removed with the type                                                  | Decide the loss before release                             |

## Scope of the removal

Each file below is removed or has its entry removed in the release. The paths are the ones that name the type, its canvas, its dependency or its agent surface; the sweep in the tasks finds the rest.

| File                                                                    | Role in the removal                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/db-schema/src/models/resource/ResourceType.ts`                | Drops the Flowchart value                                      |
| `packages/db-schema/src/services/resource/ResourceOwnedTablesMap.ts`    | Drops the Flowchart entry                                      |
| `packages/db-schema/src/schema/resource/resourcesInResource.ts`         | The resource type enum column the migration drops a value from |
| `packages/db-schema/src/models/achievement/FlowchartAchievementName.ts` | Deleted with the achievement                                   |
| `packages/db-schema/src/services/achievement/AchievementName.ts`        | Drops the achievement from the name union                      |
| `apps/web/shared/models/achievement/AchievementCategory.ts`             | Drops the Flowchart category                                   |
| `apps/web/shared/models/flowchartEditor`                                | Deleted: the graph's models and their tests                    |
| `apps/web/shared/models/trpc/TRPCProcedureInputs.ts`                    | Drops the flowchart save input                                 |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`            | Drops the Flowchart definition                                 |
| `apps/web/shared/services/superjson/JSONClassMap.ts`                    | Drops the flowchart classes                                    |
| `apps/web/server/trpc/routers/flowchart.ts`                             | Deleted: the flowchart router                                  |
| `apps/web/server/trpc/routers/index.ts`                                 | Drops the flowchart router                                     |
| `apps/web/server/trpc/routers/resourceDispatch.ts`                      | Drops the flowchart dispatch entry                             |
| `apps/web/app/components/Resource/Flowchart`                            | Deleted: editor, published view, dialogs and export canvas     |
| `apps/web/app/components/FlowchartEditor`                               | Deleted: nodes, edges, panels and the sidebar                  |
| `apps/web/app/services/flowchartEditor`                                 | Deleted: node and edge maps, path functions and constants      |
| `apps/web/app/composables/flowchartEditor`                              | Deleted: drag and drop                                         |
| `apps/web/app/store/flowchartEditor`                                    | Deleted: the editor and export stores                          |
| `apps/web/app/services/resource/flowchart`                              | Deleted: the export capture and its SVG rasterizing            |
| `apps/web/app/models/resource/FlowchartExportRequest.ts`                | Deleted                                                        |
| `apps/web/app/models/resource/FlowchartExportFormat.ts`                 | Deleted                                                        |
| `apps/web/app/services/resource/PortableFormatMap.ts`                   | Drops the flowchart formats                                    |
| `apps/web/app/services/resource/ResourceBladeDefinitionMap.ts`          | Drops the entry                                                |
| `apps/web/app/services/resource/ResourceDialogsComponentMap.ts`         | Drops the entry                                                |
| `apps/web/app/services/resource/ResourceEditorComponentMap.ts`          | Drops the entry                                                |
| `apps/web/app/services/resource/ResourceTypeDescriptionMap.ts`          | Drops the entry                                                |
| `apps/web/app/services/resource/ViewComponentMap.ts`                    | Drops the published view entry                                 |
| `apps/web/package.json`                                                 | Drops the five `@vue-flow` dependencies                        |
| `pnpm-workspace.yaml`                                                   | Drops the five catalog entries                                 |
| `pnpm-lock.yaml`                                                        | Regenerated by `pnpm i`, without the Vue Flow packages         |
| `.agents/ledgers/dependencies.md`                                       | Drops the Vue Flow rows, with their last import                |
| `.agents/ledgers/quality/shared.md`                                     | Drops the flowchart editor row                                 |
| `openspec/specs/resource/README.md`                                     | Drops the three flowchart capabilities from the index          |
| `openspec/specs/architecture/agent-content-tools/design.md`             | Drops its flowchart rows                                       |
| `openspec/changes/resource-roadmap/tasks.md`                            | Drops the flowchart shapes line, and links this change         |

## Specs

This change writes no spec delta now. Its removal is recorded as REMOVED requirements in the three flowchart capabilities when the change is built, since the requirement names are read from those specs then. The capabilities are `openspec/specs/resource/flowchart-connectors`, `flowchart-image-export` and `flowchart-publish`, and the archive deletes their folders.

## Sources

- [Flowchart on the editor core](../../deferred/resource/flowchart-on-editor-core/design.md): the removal future, and the rule that a resource type leaves PostgreSQL only once no row holds it.
- [Whiteboard](../resource-whiteboard/design.md): the capabilities the feature check reads.
