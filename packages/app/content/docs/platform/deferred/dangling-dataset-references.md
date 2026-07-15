---
title: Dangling dataset references
description: Deferred — surfacing a "source no longer available" state when a DatasetReference's source resource is deleted.
---

# Dangling dataset references

Handling a `DatasetReference` whose source resource has been deleted, so a bound Dashboard visual or Email merge field surfaces a clear "source no longer available" state instead of a silent empty/failed resolve.

## Why not a DB cascade

A `DatasetReference` (`{ type, id }`) lives **inside the consumer's content blob** (JSON in Azure Blob), not in a Postgres column — there is no relational FK edge, so Drizzle `onDelete: "cascade"` has nothing to fire on. And cascade-**delete** would be the wrong operation regardless: deleting a source Sheet must **blank/flag** the binding, never delete the Dashboard that binds to it. Only **references** dangle (Dashboard bind, Email merge fields); **imports** copied rows once and are immune.

## Why deferred

Eager cleanup means null-the-reference / mark-broken, which needs either a reverse-reference index (a `resource_references` join table) or a scan of all consumers on delete, then a **rewrite of each consumer's content blob** (respecting its `contentVersion`) — real cross-resource write machinery. Acceptable to skip while binding is new and single-owner: today the consumer re-resolves on load and `dataset.readDataset` fails/returns empty. Published snapshots are unaffected — they bake the data in at publish time.

## Revisit when

A real user deletes a source that another resource references, and the silent-empty behaviour is an observed annoyance.

## Cheaper interim

On resolve failure, the consumer renders `StyledEmptyState` ("source no longer available") in place of the visual/field rather than erroring — no delete-time dependency scan.
