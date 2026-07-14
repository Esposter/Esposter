---
title: File → Sheet Rename
description: Rename the File resource type to Sheet — the suite reads doc/sheet/form/site once Note lands, and "File" stops colliding with the FileAssets capability and file imports.
---

# File → Sheet Rename

Rename the **File** resource type to **Sheet**. With [Note](/docs/proposals/platform/note-resource) filling the document slot, the suite reads as the familiar doc / **sheet** / form / site family — and "File" currently overclaims and collides twice: the type is specifically tabular data (not arbitrary file storage), _file_ remains the correct word for the CSV/JSON/XLSX artifacts you **import into** a Sheet, and the upcoming [FileAssets capability](/docs/proposals/platform/resource-file-assets) puts a second, different "file" concept into the same vocabulary. After the rename each word means exactly one thing: **Sheet** = the resource, **file** = an import/export artifact, **file assets** = hosted binaries.

## Scope

A mechanical, whole-hog rename — **no backwards compatibility** (nothing in production; stale persisted references are discarded, consistent with the platform's no-production-data stance). One pg migration, zero behavior changes. What does **not** rename: `DataSourceType` (Csv/Json/Xlsx) and the `DataSource`/`Column`/`Row` model family — they describe _how a file is encoded_ and the grid data itself, which is the other axis ([datasets](/docs/architecture/datasets)) and stays correct; their superjson-registered class names (`StringColumn`, `Row`, …) contain no "File" and are untouched in `JSONClassMap`.

## Rename map

| Today                                                                                                                                                     | After                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ResourceType.File = "File"` (pg enum value)                                                                                                              | `ResourceType.Sheet = "Sheet"` (`ALTER TYPE … RENAME VALUE` migration — generated on request, never auto-run)                                                  |
| `DatasetProviderType.File`                                                                                                                                | `DatasetProviderType.Sheet` (persisted `DatasetReference.type` strings in dashboard/email blobs go stale — discarded, consumers already fail soft)             |
| `file` router + `readFileDataset` provider                                                                                                                | `sheet` router + `readSheetDataset`                                                                                                                            |
| achievement `triggerPath: "file.saveResourceContent"` (`TableAchievementDefinitionMap`)                                                                   | `"sheet.saveResourceContent"` + rename the map to `SheetAchievementDefinitionMap` (its "Table" name is a second-generation legacy already)                     |
| `shared/models/resource/file/` folder                                                                                                                     | `shared/models/resource/sheet/` (`fileResourceSchema` → `sheetResourceSchema`, `FileResource` → `SheetResource`, `fileSettingsSchema` → `sheetSettingsSchema`) |
| `app/components/Resource/File/*`, `store/resource/file/` (`useFileStore`, `fileHistory`)                                                                  | `Resource/Sheet/*`, `store/resource/sheet/`                                                                                                                    |
| `PortableFormatMap[ResourceType.File]`, `createFilePortableFormat`                                                                                        | `[ResourceType.Sheet]`, `createSheetPortableFormat`                                                                                                            |
| `ResourceDefinitionMap` entry title "File"                                                                                                                | "Sheet" (icon: a grid/table glyph)                                                                                                                             |
| docs: [file resource](/docs/platform/file-resource) page, the `file-table-editor` docs area + `DocsSectionGroupsMap` slugs, every `File resource` mention | `sheet-resource`, `sheet-editor` area, sweep all references in the same change (no stale content rule)                                                         |

Import/Export UX copy keeps the word _file_ where it genuinely means one: "Import a file", format labels, `accept`/MIME wiring — you import a file, you get a Sheet.

## Notes

- **Order matters cheaply**: land this before the funnel proposals multiply "File"-as-audience references in code ([program resource](/docs/proposals/platform/program-resource) binds "a File of recipients" — those specs get their mentions updated when this ships, per the docs sweep).
- In-flight proposals deliberately keep saying "File" until the rename lands — proposals describe today's names; the ship-time docs sweep is part of this item's definition of done.
- The `resources` table itself is untouched (the type lives in the pg enum, ids and blobs are name-free).
- Verify after rename: `pnpm db:gen` output reviewed by the user, `export:gen` in touched packages, and the existing router/dataset tests (they reference the renamed callers and enum — the compile errors are the checklist).
