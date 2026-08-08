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

A portal group is a containment relationship — a resource is _inside_ exactly one — and our resources have no container at all, the same fact that keeps the breadcrumb from deriving ancestry ([breadcrumb trail](/docs/platform/breadcrumb-trail)). That is why the [service menu](/docs/platform/resource-service-menu) copied the portal's shape but gave tags the route a Groups entry would have taken.
