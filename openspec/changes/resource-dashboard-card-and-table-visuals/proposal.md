# Dashboard Card and Table Visuals

## Why

Every dashboard visual is a chart bound to a dataset through one query of a category column and aggregated series. The two visuals a report is most often opened for are missing: the single number, such as "412 responses" or "average rating 4.3", and the exact values behind a chart. Power BI covers them with a Card, a measure's value as a large callout, and a Table, rows and columns with headers and a totals row, for reviewing exact values rather than visual representations.

## What Changes

The dashboard gains a Card for one number and a Table for exact values, both listed first in the visual picker.

- A Card shows the first series of its binding, aggregated over every row, with a label beneath it that defaults to the aggregation of the column and can be edited. Unbound, it shows the demo value. Large numbers use the compact form, such as 12K.
- A Table shows the grouped result as rows with sortable headers and one column per series. Its totals row sums only series aggregated by count or sum, and leaves an average or an extreme blank.
- A Table and a chart over the same binding show the same values.
- The chart settings and the chart-interaction features do not apply to either kind.
- **Capabilities:** `resource/dashboard-card-and-table-visuals` (new).

## Capabilities

- **resource/dashboard-card-and-table-visuals** (new)

## Waiting on

None.

## Impact

- The dashboard's visual kinds, the visual picker and its ordering.
- The visual renderer, which hands the two new kinds to their own components and keeps their loading, error and row-cap states.
- The visual edit dialog, which hides the chart type and chart settings for the two kinds and shows the Card's label.
- The demo data an unbound Card and Table show.

Size kept as the source page's own: splitting it is a later decision.
