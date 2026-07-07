# Platform

Cross-product integration program: everything is a resource with opt-in capabilities. The layer model is [`/architecture/platform.md`](../../architecture/platform.md); the standards are [`/architecture/resources.md`](../../architecture/resources.md), [`/architecture/datasets.md`](../../architecture/datasets.md), [`/architecture/publishing.md`](../../architecture/publishing.md).

## Now

**Resource Explorer consolidation** — all editors + surveyer unify into the resource model and one Azure-portal-like explorer. Phase 1 (schema + factory + container) shipped; **Phase 2 — explorer shell** (Azure-portal-faithful Home + full list + create flow + blade page) is next. Phased backlog in [`roadmap.md`](roadmap.md); UX shell in [specs/resource-explorer.md](specs/resource-explorer.md).

## Shipped

Documents-era phases below built the mechanisms the resource model generalizes — their specs are superseded where noted.

- Phase 1 — dataset contract, `dataset.readDataset` + SurveyResponses/TableDocument providers, table-editor survey-responses import (`/architecture/datasets.md`)
- Phase 2 — dashboard visual dataset binding: `Visual.dataset` reference + query, client aggregation, bind-to-data form, per-visual refresh ([spec](specs/dashboard-data-binding.md))
- Phase 3 — `documents` table + `createDocumentProcedures` factory + `useDocumentState`/`DocumentPicker` across all 5 editors (superseded by `/architecture/resources.md`)
- Phase 4 — document publish lifecycle with baked dataset snapshots + public `/view/dashboard/[id]` (`/architecture/publishing.md`)
- Phase 5 — email personalization: merge-field blocks, survey invite blocks, per-row HTML export ([spec](specs/email-personalization.md))
- Polish — dashboard binding form gained table-document sources + multi-series editing ([spec](specs/dashboard-data-binding.md)); public `/view/webpage/[id]` render + published-view OG meta tags (`/architecture/publishing.md`)
- Survey distribution fixes (2026-07-06 audit) — publish sets `publishedAt` + snapshots the model; the public respondent page serves that snapshot and 404s for unpublished surveys; `RoutePath.Survey(id)` points at the public page so email invite blocks link correctly

## Decisions

Grep [out-of-scope/](out-of-scope) (won't do) and [deferred/](deferred) (not yet) before adding a roadmap item.

## Reference

- [`/architecture/platform.md`](../../architecture/platform.md) — cross-product layer model, capability matrix, journey diagram
- [specs/](specs) — resource explorer shell, file/survey resource folds, dashboard data binding, email personalization, shell cohesion
- `.claude/skills/grapesjs` — editor integration conventions (useGrapesJsEditor, block sync, save-time capture)
