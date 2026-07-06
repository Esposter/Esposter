# Dataset Row-Cap Pagination

Paginating `dataset.readDataset` beyond the 10 000-row cap (`MAX_DATASET_ROWS`).

## Why deferred

Datasets serve visualization, import, and export; no consumer has hit the cap, and pagination would complicate every provider and consumer for a need that may never materialize.

## Revisit when

A real consumer (dashboard binding, table-editor import, email personalized export) hits the cap on real data.
