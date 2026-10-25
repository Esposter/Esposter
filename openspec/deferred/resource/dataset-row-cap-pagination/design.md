# Dataset row-cap pagination

Paginating `dataset.readDataset` beyond the row cap (`AZURE_MAX_PAGE_SIZE`, declared in `packages/azure/src/services/shared/constants.ts` and applied consistently by every provider).

## Why deferred

Datasets serve visualization, import, and export; no consumer has hit the cap, and pagination would complicate every provider and consumer for a need that may never materialize.

## Revisit when

A real owner's dataset is read past the cap: a consumer (dashboard binding, Sheet import, email personalized export) shows the truncation warning of [the row-cap warning](../../../specs/resource/dataset-row-cap-warning/spec.md) for data an owner keeps, not a test fixture. The warning is the signal, since a truncated read states how many rows it shows and how many exist, so the trigger needs no query against production. The consumer list is not the trigger: all three consumers have shipped, and none says whether its datasets have reached the cap.
