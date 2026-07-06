# Platform

Cross-product integration program: implement the documents, datasets, and publishing standards across surveyer, table editor, dashboard, and the email/webpage/flowchart editors. The layer model and diagram are [`/architecture/platform.md`](../../architecture/platform.md); the standards themselves are [`/architecture/documents.md`](../../architecture/documents.md), [`/architecture/datasets.md`](../../architecture/datasets.md), [`/architecture/publishing.md`](../../architecture/publishing.md).

## Now

Layer contracts all shipped; reopened after the 2026-07-06 cross-product audit. Active work — distribution-flow bug fixes, cross-product navigation, and shell cohesion — is in [`roadmap.md`](roadmap.md).

## Shipped

- Phase 1 — dataset contract, `dataset.readDataset` + SurveyResponses/TableDocument providers, table-editor survey-responses import (`/architecture/datasets.md`)
- Phase 2 — dashboard visual dataset binding: `Visual.dataset` reference + query, client aggregation, bind-to-data form, per-visual refresh ([spec](specs/dashboard-data-binding.md))
- Phase 3 — `documents` table + `createDocumentProcedures` factory + `useDocumentState`/`DocumentPicker` across all 5 editors (`/architecture/documents.md`)
- Phase 4 — document publish lifecycle with baked dataset snapshots + public `/view/dashboard/[id]` (`/architecture/publishing.md`)
- Phase 5 — email personalization: merge-field blocks, survey invite blocks, per-row HTML export ([spec](specs/email-personalization.md))
- Polish — dashboard binding form gained table-document sources + multi-series editing ([spec](specs/dashboard-data-binding.md)); public `/view/webpage/[id]` render + published-view OG meta tags (`/architecture/publishing.md`)
- Survey distribution fixes (2026-07-06 audit) — `publishSurvey` sets `publishedAt` and snapshots the model to the publish dir; the public `/survey/{id}` page serves that snapshot and 404s for unpublished surveys (creators preview via the SurveyJS editor); `RoutePath.Survey(id)` now points at the public respondent page (creator route renamed `SurveyerEdit`), so email survey-invite blocks link correctly

## Decisions

Grep [out-of-scope/](out-of-scope) (won't do) and [deferred/](deferred) (not yet) before adding a roadmap item.

## Reference

- [`/architecture/platform.md`](../../architecture/platform.md) — cross-product layer model, diagram, and the contract docs it links
- [specs/](specs) — product-specific applications of the standards (dashboard data binding, email personalization)
- `.claude/skills/grapesjs` — editor integration conventions (useGrapesJsEditor, block sync, save-time capture)
