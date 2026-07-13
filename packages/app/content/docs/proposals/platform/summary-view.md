---
title: Summary View
description: Portal List/Summary toggle on /resources/all — per-type count cards over a grouped-count procedure.
---

# Summary View

The portal's List/Summary toggle on `/resources/all`: a summary mode replacing the table with per-type count cards.

## Scope

**Today**: `/resources/all` is the list workbench ([list filters & views](/docs/platform/list-filters-and-views)) — table only. **This proposal adds** a view toggle whose Summary mode renders one card per resource type (icon, title, count; click → the list re-filtered to that type) over a new grouped-count procedure. Frontend + one procedure — no schema changes.

## Procedures

| Procedure               | Auth   | Input                      | Purpose            |
| ----------------------- | ------ | -------------------------- | ------------------ |
| `resource.countsByType` | authed | filter schema sans `types` | summary-view cards |

`countsByType` is `select type, count(*) … group by type` behind `createResourcesWhere`, so the cards always agree with the list's `count` (one filter source).

## Key files

| File                                   | Role                            |
| -------------------------------------- | ------------------------------- |
| `app/components/Resource/ListView.vue` | view toggle + summary card grid |
| `server/trpc/routers/resource.ts`      | grouped-count procedure         |

## Notes

- Card click sets the `types` filter (URL-synced), landing back in list mode pre-filtered — no separate route.
