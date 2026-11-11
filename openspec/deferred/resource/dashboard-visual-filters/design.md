# Dashboard visual filters

A filter on one visual, set by the owner, that keeps only the rows a condition accepts before the visual aggregates them, as Power BI's visual-level filter does ([Add a filter to a report](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-report-add-filter)).

## Why deferred

A filter before aggregation is the first piece of the query language the [slicers](../dashboard-slicers/design.md) wait on, and building it for one visual would fix a shape the slicers then change, since a slicer's filter is synced across visuals and held by the reader. A column of the Sheet the visual reads can already be filtered at its source, which every visual over it then shares.

## Revisit when

The [slicers](../dashboard-slicers/design.md) are built, so one filter model serves the owner's visual filter and the reader's slicer. Or an owner keeps a second Sheet only to hold a subset of the first for one chart.
