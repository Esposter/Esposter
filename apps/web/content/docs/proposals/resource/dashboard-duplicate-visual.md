---
title: Dashboard duplicate visual
description: Proposal — a Duplicate action on a dashboard tile's corner copies the visual, its chart settings and its binding, as Power BI's copy and paste of a visual does, so a second chart over the same data starts configured.
model: claude-opus-5-5
---

# Dashboard Duplicate Visual

A dashboard visual carries a visual type, a chart configuration, and a dataset binding of a provider, a resource, an x column and several aggregated series ([dashboard data binding](/docs/resource/dashboard-data-binding)). Two charts over the same data — a Bar and a Line of the same series, or the same query split by a different column — are the common case, and today the second one is built from nothing: Add visual creates a default Area with no binding, and every picker is walked again.

Power BI copies a visual with Ctrl+C and pastes it with Ctrl+V, carrying "settings and formatting that you explicitly set" with it.

## What it adds

- **Duplicate** on the tile's corner, between Edit and Delete. It creates a copy of the visual with a new id — the same type, chart configuration and binding (reference and query, never a publish snapshot) — placed under the original at the original's width and height, and saves the dashboard through the store's one write path, rolling the copy back if the save fails as a delete does.
- **The copy opens nothing.** It is the original's twin on the grid; clicking it edits it like any tile.

## What is deliberately not in it

- **No clipboard.** A copy between two dashboards is a copy between two resources, and a pasted binding would name a source the destination's owner already owns anyway; one Duplicate inside the dashboard covers the case the data shows.
- **No multi-select.** One tile at a time, as Delete is.

## Key files

| File                                                             | Role after the change                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/web/app/store/dashboard/visual.ts`                         | `duplicateVisual` — clone, place, save, roll back on failure |
| `apps/web/app/components/Dashboard/Visual/Preview/Container.vue` | the Duplicate button in the tile's corner                    |

## Sources

- [Microsoft Learn — Report view in Power BI Desktop](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-view) — copy and paste of a visual, carrying the settings set on it.
