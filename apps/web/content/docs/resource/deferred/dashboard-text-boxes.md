---
title: Dashboard text boxes
description: Deferred — Power BI's text box, a visual holding a heading or a paragraph of commentary on the dashboard's grid.
---

# Dashboard Text Boxes

A Power BI report puts headings and commentary on its canvas as text boxes beside the visuals. Here it would be a visual kind holding a short rich-text body, laid out on the grid like any tile.

## Why deferred

Every visual renders through ApexCharts today, and a non-chart kind needs the dispatch that [card and table visuals](/docs/proposals/resource/dashboard-card-and-table-visuals) introduces. Each chart already carries its own title and subtitle, which covers the labelling a text box is mostly used for.

## Revisit when

Card and table visuals ship, and a dashboard needs a section heading or a paragraph no chart title can hold.

## Cheaper interim

A chart's title and subtitle; a Note published beside the dashboard for longer commentary.
