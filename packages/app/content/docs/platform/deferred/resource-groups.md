---
title: Resource groups
description: Deferred — Azure-style user-defined grouping of resources in the explorer list.
---

# Resource groups

Azure-style grouping of resources (the surveyer's `group` column generalized): user-defined folders/groups in the explorer list.

## Why deferred

Only surveys had grouping, and the explorer's type facets + search cover current volumes. Keeping a `group` column "just in case" on every resource would be speculative schema.

## Revisit when

A user's flat resource list with type facets and search is no longer sufficient to find things — that is the signal to design proper resource groups (a first-class grouping entity, not a text column). If [tags](/docs/platform/tags) usage grows into "give me a folder", that is this trigger.
