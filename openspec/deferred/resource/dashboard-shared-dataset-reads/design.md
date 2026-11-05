# Dashboard shared dataset reads

Visuals over one source would read it once between them: a keyed read in `useDataset` so that six charts over one sheet share one read, with the requirement and its scenario returning to the [live canvas spec](../../../specs/resource/dashboard-live-canvas/design.md) alongside the test that proves them.

## Why deferred

`useDataset` keeps one read and one latest-wins key per instance, so six charts over one sheet make six reads, each capped at the dataset row limit. Nothing measures that as a cost. A shared read adds a question the per-instance read does not have: how long the shared result lives and what invalidates it when the source sheet is saved while the dashboard is open, since a stale share would draw every chart from rows one of them no longer shows.

## Revisit when

A real dashboard's load shows its reads of one source as a measured cost, in request count or in time to a drawn chart.

## Cheaper interim

None needed: each read is row-capped and the visuals draw as their own reads land.
