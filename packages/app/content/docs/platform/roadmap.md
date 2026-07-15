---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Next — survey funnel leftovers

The audience → email invite → survey → responses → dashboard loop is closed end to end: [response modes](/docs/platform/survey-response-modes), the [Program resource](/docs/platform/program-resource), [response controls](/docs/platform/survey-response-controls), [response management](/docs/platform/survey-response-management), and [published view analytics](/docs/platform/published-view-analytics) all shipped, with the café-scenario chain covered by `surveyFunnel.integration.test.ts`. What remains is distribution parity for the other publishable editor:

- [ ] Webpage survey invite blocks ([spec](/docs/proposals/platform/webpage-survey-invite-blocks)): the email editor's invite blocks in the webpage editor via a shared block builder

## Later — editors and capability parity

- [ ] Resource file assets ([spec](/docs/proposals/platform/resource-file-assets)): promote Survey's `{id}/files` SAS machinery to a FileAssets capability + GrapesJS Asset Manager wiring — hosted images for Email/Webpage instead of base64, prerequisite for email sending
- [ ] Email web view ([spec](/docs/proposals/platform/email-web-view)): Email opts into Publishable — save-time HTML capture, `/view/email/[id]` "view in browser" page (best after file assets)
- [ ] Flowchart publish ([spec](/docs/proposals/platform/flowchart-publish)): Flowchart opts into Publishable — read-only VueFlow view, the simplest capability adoption
- [ ] Note resource ([spec](/docs/proposals/platform/note-resource)): rich-text document type on the existing Tiptap dependency — and a live test of the one-ResourceType extensibility claim

## Later — storage-backed (one Postgres migration or Azure table each, independently shippable)

- [ ] Summary view toggle on `/all`: per-type count cards over a grouped `count` procedure ([spec](/docs/proposals/platform/summary-view))

## Later — known defects

- [ ] Resource content date revival ([spec](/docs/proposals/platform/resource-content-date-revival)): `readResourceContent` revives ISO datetime strings into `Date`s that `columnValueSchema` then rejects — a Sheet cell holding an ISO datetime fails to read today; reproduce before fixing

## Later — larger or multi-area

- [ ] Blueprint resource ([spec](/docs/proposals/platform/blueprint-resource)): parameterized executable manifest of resources — deploy one blueprint, get a fully wired set with all the right settings and cross-references
- [ ] Blueprint capture ([spec](/docs/proposals/platform/blueprint-capture)): Save-as-blueprint on selected resources — contents captured, cross-resource ids rewritten to aliases automatically (best after the Blueprint resource ships)
- [ ] Publish history blade ([spec](/docs/proposals/platform/publish-history)): list `{id}/published/{n}` snapshots with view/restore-to-draft — verify snapshot retention first
- [ ] Dataset row-cap warning ([spec](/docs/proposals/platform/dataset-row-cap-warning)): surface "showing N of M" when a dataset hits the 1000-row `AZURE_MAX_PAGE_SIZE` cap — a real survey can silently truncate today
- [ ] Share to esbabbler ([spec](/docs/proposals/platform/share-to-esbabbler)): Share command posting the public link into a room you pick
- [ ] Create from file ([spec](/docs/proposals/platform/create-from-file)): drop a CSV/JSON/XLSX on the Sheet create form, land in a ready Data blade
- [ ] TodoList due reminders ([spec](/docs/proposals/platform/todolist-due-reminders)): scheduled Service Bus + web-push when an item comes due
