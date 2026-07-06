# Platform Roadmap

Reopened after the 2026-07-06 cross-product audit. The layer contracts (documents, datasets, publishing, events) are shipped and solid; the open work is the **distribution half of the survey journey** (broken today), **cross-product navigation** (the loops exist as data but not as links), and **shell cohesion**. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items.

## Distribution-flow fixes — survey → respond → analyse loop

The three confirmed bugs that broke the survey distribution half are fixed (see [`## Shipped`](README.md) for the summary). The design decision: a survey is a **published artifact** like any document — the public `/survey/{id}` page serves only the versioned snapshot and 404s for unpublished surveys; creators preview drafts via the SurveyJS editor's built-in Preview tab. Remaining polish:

- [ ] **Copy-link on survey publish.** `PublishSurveyDialog` only bumps the version; add the copy-public-link affordance the `Document/PublishButton` already has for dashboard/webpage, pointing at `RoutePath.Survey(id)`.

## In progress — shell cohesion overhaul (chosen direction)

The "nicer, more linked UI" ask, scoped with the user: full shell overhaul + trim nav to core with a Games submenu, calendar folded into the table editor.

- [ ] **Nav trim.** `ProductListLinkItems` keeps the productivity tools flat and moves Clicker/Dungeons under a "Games" submenu (`children` on `ListLinkItem`, rendered as a `v-list-group`). Calendar is not a nav item — it lives inside the table editor.
- [ ] **Shared editor shell.** Extract `StyledPageHeader` (title + breadcrumb + controls + actions slots, a proper toolbar layout — not controls crammed in `v-toolbar-title`) and adopt it across the table/dashboard/email/webpage/surveyer editors, mounting `DocumentPicker` + publish + dataset controls uniformly.
- [ ] **Shell primitives.** Add `StyledEmptyState` and a skeleton-loader wrapper to the `Styled/` set; add breadcrumbs to the app bar.
- [ ] **Unified "My Documents" hub.** A `/documents` page listing documents across all types (type icon, open/publish/share), generalising surveyer's `StyledDataTableServer` list. Needs a cross-type `documents` list procedure.
- [ ] **Calendar in table editor.** Surface the existing TodoList calendar as a view inside the table editor rather than an orphaned page.

## Next — cross-product navigation (no new infra, extends shipped features)

The data loops exist; the UI links do not. All reuse existing procedures/components.

- [ ] **Surveyer → analyse.** Add row/action links from the survey list (`Survey/CrudView/ActionSlot.vue`) to "View responses" (table-editor import, `ImportDatasetButton` already exists) and "Build dashboard" (pre-select the survey in `Dataset/ReferencePicker`).
- [ ] **Response count surface.** No endpoint returns per-survey response counts (`survey.count` counts _surveys_). Add a count so the creator sees engagement without a full 10k-row read.
- [ ] **"Share to esbabbler"** from `Document/PublishButton` (and survey publish): post the public `/view` URL into a room — messaging is the obvious distribution channel and has zero affordance today.
- [ ] **Editor/view dead-ends.** `/view/*` pages and the `/dashboard` viewer have no back-link into the editor and the viewer isn't in global nav — add contextual links.

## Later

- [ ] **Command palette (⌘K).** Vuetify has no built-in; buildable from `v-dialog` + `v-list` over `ProductListLinkItems` + document search.

## Notes

- Everything above is TypeScript + already-installed OSS — **zero new dependencies, zero new Azure services**. The only journey step needing new infrastructure is actually sending email ([deferred/email-sending.md](deferred/email-sending.md)).
- The 10k dataset row cap ([deferred/dataset-row-cap-pagination.md](deferred/dataset-row-cap-pagination.md)) silently truncates analysis on large surveys — revisit-trigger noted there; surface a "showing N of M" warning if a real survey approaches it.
