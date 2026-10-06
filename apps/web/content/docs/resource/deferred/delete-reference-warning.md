---
title: Delete-time reference warning
description: Deferred — a delete confirmation that says how many other resources reference the one being deleted, and which.
---

# Delete-Time Reference Warning

Deleting a resource that others consume would say so before it happens: "this Sheet is used by 2 dashboards and 1 email", with the consumers named, in the delete confirmation. The consumers are already indexed, so the count is one read of the [resource-link index](/docs/architecture/resource-links) on the target and role.

## Why deferred

- **A delete is already recoverable.** It is a soft delete: the toast after it offers Restore, the recycle bin holds the resource for its retention window, and a consumer whose source is gone says so where its reference is picked ([datasets](/docs/architecture/dataset)). Purge is the one destructive step, and it already has a type-the-name guard.

## Revisit when

The [resource references](/docs/resource/deferred/resource-references) panel gets built, since the same read serves both. Or an owner purges a resource that was still in use and loses a binding they didn't know they had.
