---
title: Dashboard slicers
description: Deferred — Power BI's slicer, an on-canvas filter control that narrows the rows every other visual on the dashboard aggregates.
---

# Dashboard Slicers

Power BI's [slicer](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-slicers) is a visual whose job is filtering: a list, a dropdown or a date range on the canvas that narrows the rows every other visual on the page draws from. Here it would be a visual kind bound to one column, whose selection filters the rows of every visual over the same dataset reference before `computeDatasetVisualPropsData` aggregates them.

## Why deferred

A slicer is a reader's tool, and a published dashboard's reader today gets a baked snapshot of at most the row cap — filtering it works, but the query language it needs (a filter per binding, applied before aggregation, synced across visuals) is the first piece of a dashboard query model that [dataset joins](/docs/resource/deferred/dataset-joins) and [live refresh](/docs/resource/deferred/realtime-dataset-refresh) would each shape too. Linked highlighting already answers "show me this range on every chart" without a filter model ([dashboard chart interaction](/docs/resource/dashboard-chart-interaction)).

## Revisit when

A dashboard owner asks to narrow a published dashboard by a value rather than a range, or the dataset query gains a filter for another reason.

## Cheaper interim

Brush a range on one chart to dim it on every linked chart; bind a second visual to a Sheet filtered to the slice.
