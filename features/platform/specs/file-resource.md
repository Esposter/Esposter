# Platform — File Resource

Each imported file (CSV/JSON/XLSX) becomes its own resource — the table editor's multi-item document splits apart, and settings/data/identity land in their proper homes.

## Overview

Today `ADataSourceItem` fuses three concerns on one entity: identity (`name`), parse settings (`type` + `configuration`, e.g. CSV delimiter), and the actual data (`dataSource`: columns/rows/metadata/statistics) — all persisted together inside one `TableEditorConfiguration` blob that also holds TodoList and VuetifyComponent items. The File resource unmangles this:

| Concern                                     | New home                               |
| ------------------------------------------- | -------------------------------------- |
| Identity (name, id)                         | `resources` row                        |
| Settings (`DataSourceType` + configuration) | `settings` section of the content blob |
| Data (columns/rows/metadata/statistics)     | `data` section of the content blob     |

## Data Model Changes

```typescript
// packages/app/shared/models/resource/file/FileResource.ts — interface-first
export const fileResourceSchema = z.object({
  data: dataSourceSchema, // columns, rows, metadata, statistics
  settings: fileSettingsSchema, // { type: DataSourceType, configuration: Csv|Json|Xlsx configuration }
}) satisfies z.ZodType<FileResource>;
```

- `dataSource: DataSource | null` dies: a File resource always has a `data` section (empty `DataSource` on create); "not yet imported" is `rows.length === 0`, rendered as `StyledEmptyState` with an Import command.
- Deleted models: `TableEditorConfiguration`, `TableEditor<T>`, `TableEditorType`, `Item`, `ATableEditorItemEntity`, `ADataSourceItem` + the three `*DataSourceItem` classes, all `vuetifyComponent/` models ([out-of-scope/vuetify-component-resource.md](../out-of-scope/vuetify-component-resource.md)).
- Kept unchanged: `DataSource`, `Column` family, transformations, `DataSourceType`, per-format configurations — they relocate to `shared/models/resource/file/`.

## Capabilities

- **DatasetProvider** — `readFileDataset` reads `content.data` via `dataSourceToDataset`. `DatasetReference` is just the resource id (the old `itemId` sub-selector dies; a resource _is_ the item).
- **Portable** — `PortableFormatMap[File]` carries the three formats from today's `DataSourceConfigurationMap` (accept/mimeType/serialize/deserialize per `DataSourceType`); both Import and Export commands appear. Import stays client-side parse (no upload), 5-row preview retained.

## Blades

- **Data** — the entire current grid editor: inline editing, computed columns, statistics, clipboard, find/replace, undo/redo. Components move `TableEditor/File/*` → `Resource/File/*`.
- **Settings** — parse configuration form (delimiter etc.) editing `content.settings`; changing settings re-parses on next import, never silently rewrites data.

Both blades edit sections of one blob and save through one `saveResourceContent` with one `contentVersion`.

## Stores / composables

`store/tableEditor/` relocates to `store/resource/file/` nearly intact — the command/undo stack (`ADataSourceCommand`, `*Command.ts`, `fileHistory`) already operates on a single `DataSource`, which is exactly one File resource's `content.data`. Dies: `store/tableEditor/item.ts` (multi-item selection within a doc) and `tableEditorType` switching in the root store. The store initializes from `useResource(id)` content.

## Constraints / Notes

- **Settings-in-content-blob decision.** Rejected: a `settings` jsonb column on `resources` (untyped at the DB boundary — per-type settings schemas can't be one column schema; splits one artifact across two write paths with two version races) and a separate `{id}/settings` blob (doubles round-trips, needs its own version field for one consumer). The settings/data split is a UX separation (blades), not a storage separation (`/architecture/resources.md`).
- Existing table-editor data is discarded, not migrated (consistent with the documented no-production-data stance).
- The grid editor's feature set and out-of-scope registry stay documented in [`features/fileTableEditor/`](../../fileTableEditor/README.md).
