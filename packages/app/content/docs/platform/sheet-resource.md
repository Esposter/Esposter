---
title: Sheet Resource
description: CSV/JSON/XLSX files as resources — identity, parse settings, and grid data split into their proper homes with Data and Settings blades.
---

# Sheet Resource

Each imported file (CSV/JSON/XLSX) is its own resource. The old table editor fused three concerns on one entity (`ADataSourceItem`: identity, parse settings, and the data itself, all inside one multi-item `TableEditorConfiguration` blob); the Sheet resource keeps them separate:

| Concern                                     | Home                                   |
| ------------------------------------------- | -------------------------------------- |
| Identity (name, id)                         | `resources` row                        |
| Settings (`DataSourceType` + configuration) | `settings` section of the content blob |
| Data (columns/rows/metadata)                | `data` section of the content blob     |

## Data model

```ts
// packages/app/shared/models/resource/sheet/SheetResource.ts — interface-first
export const sheetResourceSchema = z.object({
  data: dataSourceSchema, // columns, rows, metadata
  settings: sheetSettingsSchema, // discriminatedUnion("type"): Csv | Json | Xlsx file settings
}) satisfies z.ZodType<ToData<SheetResource>>;
```

A Sheet resource always has a `data` section (empty `DataSource` on create) — there is no `dataSource: null` state. "Not yet imported" is `rows.length === 0`, rendered as `StyledEmptyState` with an Import command. The `Column` family and the per-format configurations live in `shared/models/resource/sheet/`; `DataSource`, `DataSourceType` and the transformations sit under its `datasource/` subfolder.

## Capabilities

- **DatasetProvider** — `readSheetDataset` reads `content.data` via `dataSourceToDataset`. A `DatasetReference` is just the resource id — a resource _is_ the item, so there is no sub-item selector.
- **Portable** — `PortableFormatMap[ResourceType.Sheet]` carries the three formats (accept/mimeType/serialize/deserialize per `DataSourceType`); both Import and Export commands appear in the command bar. Import is a client-side parse (no upload) with a 5-row preview. The xlsx codecs `await import` their workbook libraries inside `serializeXlsx`/`deserializeXlsx` rather than at module scope: the command bar renders on every resource page, so a static import would ship a parser to the eight types that can neither import nor export.

## Blades

- **Data** — the entire grid editor: inline editing, computed columns, statistics, clipboard, find/replace, undo/redo. Components live under `Resource/Sheet/*`; the grid's feature set is documented in the [sheet editor](/docs/sheet-editor) area.
- **Settings** — parse configuration form (delimiter etc.) editing `content.settings`; changing settings re-parses on next import, never silently rewrites data.

Both blades edit sections of one blob and save through one `saveResourceContent` with one `contentVersion`.

## Key files

| File                                            | Role                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| `shared/models/resource/sheet/SheetResource.ts` | content blob schema (`data` + `settings`)           |
| `app/components/Resource/Sheet/Data.vue`        | Data blade (grid editor)                            |
| `app/components/Resource/Sheet/Settings.vue`    | Settings blade (parse configuration form)           |
| `app/store/resource/sheet/`                     | grid state + command/undo stack over `content.data` |
| `app/services/resource/PortableFormatMap.ts`    | CSV/JSON/XLSX import/export formats                 |

## Notes

- **Settings live in the content blob, not a column.** Rejected alternatives: a `settings` jsonb column on `resources` (untyped at the DB boundary — per-type settings schemas can't be one column schema; splits one artifact across two write paths with two version races) and a separate `{id}/settings` blob (doubles round-trips, needs its own version field for one consumer). The settings/data split is a UX separation (blades), not a storage separation ([/docs/architecture/resources](/docs/architecture/resources)).
- The store's command/undo stack (`ADataSourceCommand`, `fileHistory`) operates on a single `DataSource` — exactly one Sheet resource's `content.data`; it initializes from `useResourceStore` content.
- **Row, column and byte counts are derived, not stored.** `computeDataSourceStatistics` reads them off `columns` and `rows` when the status bar renders. Persisting them meant every command re-syncing a copy that could only ever restate the blob it sits in, or drift from it.
- Existing table-editor data was discarded, not migrated (consistent with the no-production-data stance). The multi-item models (`TableEditorConfiguration`, `ADataSourceItem`, `vuetifyComponent/` — see [decision](/docs/platform/rejected/vuetify-component-resource)) were deleted with the fold.
