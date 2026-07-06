# Platform — Dashboard Data Binding

Let a dashboard visual bind to a `DatasetReference` (survey responses, table document) instead of only embedding static chart data — the marquee cross-product integration, applying the datasets standard to the dashboard product.

## Overview

Today each `Visual` embeds its own `Chart` data; dashboards cannot show survey results without manual copying. This adds an optional binding: a visual that carries a reference + query resolves its chart data from `dataset.readDataset` at render time. Static visuals keep working unchanged — binding is additive, not a rewrite.

## Data Model Changes

Extend `Visual` (`shared/models/dashboard/data/Visual.ts`) with an optional field, stored inside the dashboard document content — no DB changes:

```typescript
interface VisualDatasetBinding {
  reference: DatasetReference;
  query: DatasetQuery;
}

interface DatasetQuery {
  xColumn: string;
  series: { column: string; aggregation: DatasetAggregationType }[]; // count/sum/avg/min/max
}
```

## Components

- Visual editor (`pages/dashboard/editor.vue` flow): new "Bind to data" step — pick provider → pick resource (owned datasets list; surveys first, table documents later) → pick x/series columns from the dataset's `DatasetColumn[]`
- Dashboard render: resolver computes chart data from the fetched `Dataset` per bound visual; loading + error states per visual; manual refresh action

## Constraints / Notes

- Aggregation runs client-side over the row-capped dataset — no server query language. Revisit only if the row cap becomes a real limit.
- Fetch on dashboard load + manual refresh; live updates are deferred.
- A bound visual with a deleted/unreadable source renders an error state, never breaks the dashboard.
