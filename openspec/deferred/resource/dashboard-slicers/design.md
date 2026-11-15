# Dashboard Slicers

Power BI's [slicer](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-slicers) is a visual whose job is filtering: a list, a dropdown or a date range on the canvas that narrows the rows every other visual on the page draws from. Here it would be a visual kind bound to one column, whose selection filters the rows of every visual over the same dataset reference before `computeDatasetVisualPropsData` aggregates them.

## Why deferred

A slicer is a reader's tool, and a published dashboard's reader today gets a baked snapshot of at most the row cap — filtering it works, but the query language it needs (a filter per binding, applied before aggregation, synced across visuals) is the first piece of a dashboard query model that [dataset joins](../dataset-joins/design.md) and [live refresh](../realtime-dataset-refresh/design.md) would each shape too. Linked highlighting already answers "show me this range on every chart" without a filter model ([dashboard chart interaction](../../../specs/resource/dashboard-chart-interaction/design.md)).

## Revisit when

A dashboard owner asks to narrow a published dashboard by a value rather than a range, or the dataset query gains a filter for another reason.

## Cheaper interim

Brush a range on one chart to dim it on every linked chart; bind a second visual to a Sheet filtered to the slice.

## The visual filter the slicers wait on

A filter on one visual, set by the owner, that keeps only the rows a condition accepts before the visual aggregates them, as Power BI's visual-level filter does ([Add a filter to a report](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-report-add-filter)).

It is the first piece of the same query language. Building it for one visual would fix a shape the slicers then change, since a slicer's filter is synced across visuals and held by the reader. A column of the Sheet the visual reads can already be filtered at its source, which every visual over it then shares.

**Revisit when:** the slicers are built, so one filter model serves the owner's visual filter and the reader's slicer, or an owner keeps a second Sheet only to hold a subset of the first for one chart.
