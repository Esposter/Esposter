# Platform — Roadmap

Phases ordered so each ships user-visible value on its own; later phases add schema/infrastructure. Phases 1–2 need no migrations (surveys already have identity); phase 3 introduces the `documents` table. The standards being implemented: `/architecture/datasets.md`, `/architecture/documents.md`, `/architecture/publishing.md`.

## Phase 1 — Datasets: survey responses become loadable data

- [ ] Shared dataset models in `shared/models/dataset/` (`Dataset`, `DatasetColumn`, `DatasetReference`, `DatasetProviderType`) reusing `ColumnType`/`ColumnValue`
- [ ] `dataset.readDataset` tRPC procedure + `DatasetProviderMap` (one provider per file)
- [ ] `SurveyResponses` provider — columns from survey model questions, rows flattened from `SurveyResponseEntity`
- [ ] Table editor: "Survey responses" entry in import dialog → pick owned survey → import as rows/columns (one-time copy, consistent with local-first editing)
- [ ] Router tests for provider auth (owner-only) + row cap

## Phase 2 — Dashboard data binding ([spec](specs/dashboard-data-binding.md))

- [ ] `Visual` gains optional `dataset: { reference, query }`; embedded-data visuals unchanged
- [ ] `DatasetQuery` — x column, series columns, aggregation (count/sum/avg/min/max)
- [ ] Resolver: fetch dataset on dashboard load, compute chart data; manual refresh action
- [ ] Editor flow: "Bind to data" step in visual editor (provider → resource → columns)

## Phase 3 — Documents: every editor becomes multi-document

- [ ] `documents` table (Drizzle) + `DocumentType` enum (Dashboard, Email, Flowchart, Table, Webpage)
- [ ] `createDocumentProcedures(type, contentSchema, container)` factory — list/create/rename/delete/readContent/saveContent
- [ ] Migrate dashboard first: `${userId}/save` blob → first document; document picker UI
- [ ] Migrate table editor (unlocks `TableDocument` dataset provider), then email/webpage/flowchart
- [ ] Keep `useSave` localStorage fallback as the unauth single-document path

## Phase 4 — Publishing: public shareable reads

- [ ] `publishDocument` + `readPublishedDocumentContent` in the document procedures factory
- [ ] Public rate-limited `/view/[type]/[id]` pages (dashboard first: published dashboard over live survey data)
- [ ] Published-dashboard dataset resolution with owner authority, per-visual live-data opt-in (default off = static snapshot)
- [ ] Share = plain URL; works in esbabbler today

## Phase 5 — Email editor joins the data flow

- [ ] Merge-field blocks (`{{columnName}}`) bound to a `DatasetReference`
- [ ] "Survey invite" block — renders a published survey link + styled button
- [ ] Export personalized HTML per dataset row (sending itself stays deferred)
