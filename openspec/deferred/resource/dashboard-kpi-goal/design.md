# Dashboard KPI goal and trend

A Card that compares its number with a goal and shows a trend behind it, with a direction that says which way is better, as Power BI's KPI visual does ([Key Performance Indicator (KPI) visuals](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-kpi)).

## Why deferred

It needs a second value, the goal, and an ordered axis for the trend, so the Card's query would grow from one series over every row to a base, a target and an axis. A Card is one number and a second Card on the grid holds a second one, as the [card and table visuals](../../../specs/resource/dashboard-card-and-table-visuals/design.md) settled.

## Revisit when

A dashboard is asked to show progress against a target in one tile, and a Card beside a second Card no longer answers it.
