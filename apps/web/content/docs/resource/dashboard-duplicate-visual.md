---
title: Dashboard duplicate visual
description: Duplicate on a dashboard tile's corner copies the visual — its type, chart settings and binding — under the original, so a second chart over the same data starts configured.
---

# Dashboard Duplicate Visual

A dashboard visual carries a visual type, a chart configuration and a dataset binding ([dashboard data binding](/docs/resource/dashboard-data-binding)). Two charts over the same data — a Bar and a Line of the same series, or the same query split by another column — are the common case, and the second used to be built from nothing, every picker walked again. Power BI copies a visual with its settings; here the copy is one button.

## How it works

- **Duplicate visual** sits on the tile's corner between Edit and Delete. The visual store's `duplicateVisual` creates a new `Visual` with a new id and the original's type, chart configuration and binding — its reference and query, never the publish snapshot baked into a published dashboard's binding, which would draw that frozen data forever — placed directly under the original at its width and height.
- **One write path.** The copy is saved with the dashboard through the same save as every edit, on the dashboard it was issued on, and taken back out if the save is refused, as a refused delete puts its visual back.
- **The copy opens nothing.** It is the original's twin on the grid; clicking it edits it like any tile.

## What is deliberately not in it

- **No clipboard.** A copy between two dashboards is a copy between two resources; one Duplicate inside the dashboard covers the case.
- **No multi-select.** One tile at a time, as Delete is.

## Key files

| File                                                             | Role                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/web/app/store/dashboard/visual.ts`                         | `duplicateVisual` — clone, place, save, take back on refusal |
| `apps/web/app/components/Dashboard/Visual/Preview/Container.vue` | The Duplicate button in the tile's corner                    |

## Sources

- [Microsoft Learn — Report view in Power BI Desktop](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-view) — copy and paste of a visual, carrying the settings set on it.
