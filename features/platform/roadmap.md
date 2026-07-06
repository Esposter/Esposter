# Platform Roadmap

Reopened after the 2026-07-06 cross-product audit. The layer contracts (documents, datasets, publishing, events) are shipped and solid; the open work is the **distribution half of the survey journey** (broken today), **cross-product navigation** (the loops exist as data but not as links), and **shell cohesion**. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items.

## Distribution-flow fixes — survey → respond → analyse loop

The three confirmed bugs that broke the survey distribution half are fixed (see [`## Shipped`](README.md) for the summary). The design decision: a survey is a **published artifact** like any document — the public `/survey/{id}` page serves only the versioned snapshot and 404s for unpublished surveys; creators preview drafts via the SurveyJS editor's built-in Preview tab. Remaining polish:

- [ ] **Copy-link on survey publish.** `PublishSurveyDialog` only bumps the version; add the copy-public-link affordance the `Document/PublishButton` already has for dashboard/webpage, pointing at `RoutePath.Survey(id)`.

## Next — cross-product navigation (no new infra, extends shipped features)

The data loops exist; the UI links do not. All reuse existing procedures/components.

- [ ] **Surveyer → analyse.** Add row/action links from the survey list (`Survey/CrudView/ActionSlot.vue`) to "View responses" (table-editor import, `ImportDatasetButton` already exists) and "Build dashboard" (pre-select the survey in `Dataset/ReferencePicker`).
- [ ] **Response count surface.** No endpoint returns per-survey response counts (`survey.count` counts _surveys_). Add a count so the creator sees engagement without a full 10k-row read.
- [ ] **"Share to esbabbler"** from `Document/PublishButton` (and survey publish): post the public `/view` URL into a room — messaging is the obvious distribution channel and has zero affordance today.
- [ ] **Calendar is orphaned.** It renders table-editor TodoList items but is in no nav (`ProductListLinkItems` / More menu) and has no `RoutePath` entry point. Add it to nav and/or link it from the table editor.
- [ ] **Editor/view dead-ends.** `/view/*` pages and the `/dashboard` viewer have no back-link into the editor and the viewer isn't in global nav — add contextual links.

## Later — unified surfaces & shell cohesion (the "nicer, more linked UI" ask)

- [ ] **Unified "My Documents" hub.** Documents are siloed behind five per-editor `DocumentPicker` dropdowns; there is no single "all my files" page. A hub listing documents across types (with type icon, open/publish/share) makes the platform read as one product. Surveyer's richer `StyledDataTableServer` list is the UX to generalise.
- [ ] **Shared editor shell.** Every editor rolls its own bare `v-toolbar` (ad-hoc `pt-4` / `height="auto"`, some titled, some not). Extract a `StyledPageHeader` (title + breadcrumb slot + actions slot) and mount `DocumentPicker` + publish + dataset controls through it uniformly. Surveyer doesn't use `DocumentPicker` at all — fold it in or document why.
- [ ] **Missing shell primitives.** No `StyledEmptyState`, no skeleton loader (only a single global `AppLoadingIndicator`), no breadcrumbs anywhere. Add these to the `Styled/` design-system set.
- [ ] **Navigation reachability.** Product list only renders on home + login; every other page relies on the dots-grid dropdown. Consider a persistent rail / breadcrumb so users always know where they are and can cross-navigate.
- [ ] **Command palette (⌘K).** Vuetify has no built-in; buildable from `v-dialog` + `v-list` over `ProductListLinkItems` + document search. Evaluate against the simpler persistent-rail option first.

## Notes

- Everything above is TypeScript + already-installed OSS — **zero new dependencies, zero new Azure services**. The only journey step needing new infrastructure is actually sending email ([deferred/email-sending.md](deferred/email-sending.md)).
- The 10k dataset row cap ([deferred/dataset-row-cap-pagination.md](deferred/dataset-row-cap-pagination.md)) silently truncates analysis on large surveys — revisit-trigger noted there; surface a "showing N of M" warning if a real survey approaches it.
