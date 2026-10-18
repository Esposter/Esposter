# Dataset row-cap pagination

Paginating `dataset.readDataset` beyond the row cap (`AZURE_MAX_PAGE_SIZE`, declared in `packages/azure/src/services/shared/constants.ts` and applied consistently by every provider).

## Why deferred

Datasets serve visualization, import, and export; no consumer has hit the cap, and pagination would complicate every provider and consumer for a need that may never materialize.

## Revisit when

A real consumer (dashboard binding, Sheet import, email personalized export) hits the cap on real data.
