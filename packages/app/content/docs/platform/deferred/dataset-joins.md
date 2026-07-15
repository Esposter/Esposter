---
title: Dataset joins
description: Deferred — a generic join over two datasets on a key column, beyond the purpose-built program status join.
---

# Dataset joins

A generic join operation over the dataset contract: resolve two `DatasetReference`s and combine rows on a key column, for arbitrary analysis pairs. Shapes considered: a `JoinedDataset` provider taking two references + key columns, or a computed "lookup" column type on Sheet.

## Why deferred

It is a query language's first feature wearing a trench coat — key selection, join type, collision naming, and row-cap interaction all need real design. The one demonstrated join (survey responses × audience) is served purpose-built by the [Program](/docs/proposals/platform/program-resource) `ProgramStatus` dataset provider, which joins invites to responses server-side and exposes the result through the front door. A _generic_ join has no remaining consumer.

## Revisit when

A second concrete join pair appears that no purpose-built provider reasonably covers — then prefer the Sheet lookup-column shape (client-side, rides the existing computed-column machinery) over a server-side join engine.

## Cheaper interim

Import both datasets into one Sheet resource side by side and flag matches with computed columns; for small datasets this is minutes of work.
