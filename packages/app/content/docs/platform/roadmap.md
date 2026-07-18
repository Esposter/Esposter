---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Later — known defects

- [ ] Resource content date revival ([spec](/docs/proposals/platform/resource-content-date-revival)): `readResourceContent` revives ISO datetime strings into `Date`s that `columnValueSchema` then rejects — a Sheet cell holding an ISO datetime fails to read today; reproduce before fixing

## Later — larger or multi-area

- [ ] Blueprint resource ([spec](/docs/proposals/platform/blueprint-resource)): parameterized executable manifest of resources — deploy one blueprint, get a fully wired set with all the right settings and cross-references
- [ ] Blueprint capture ([spec](/docs/proposals/platform/blueprint-capture)): Save-as-blueprint on selected resources — contents captured, cross-resource ids rewritten to aliases automatically (best after the Blueprint resource ships)
- [ ] Publish history blade ([spec](/docs/proposals/platform/publish-history)): list `{id}/published/{n}` snapshots with view/restore-to-draft — verify snapshot retention first
- [ ] TodoList due reminders ([spec](/docs/proposals/platform/todolist-due-reminders)): scheduled Service Bus + web-push when an item comes due
