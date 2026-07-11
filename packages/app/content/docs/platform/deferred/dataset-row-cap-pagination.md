---
title: Dataset row-cap pagination
description: Deferred — paginating dataset.readDataset beyond the 1000-row AZURE_MAX_PAGE_SIZE cap.
---

# Dataset row-cap pagination

Paginating `dataset.readDataset` beyond the 1000-row cap (`AZURE_MAX_PAGE_SIZE`, applied consistently by every provider).

## Why deferred

Datasets serve visualization, import, and export; no consumer has hit the cap, and pagination would complicate every provider and consumer for a need that may never materialize.

## Revisit when

A real consumer (dashboard binding, File import, email personalized export) hits the cap on real data.
