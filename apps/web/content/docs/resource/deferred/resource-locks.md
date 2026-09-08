---
title: Resource locks
description: "Deferred — Azure lock parity: CanNotDelete / ReadOnly markers enforced by the factory."
---

# Resource locks

Azure lock parity: a `CanNotDelete` / `ReadOnly` marker on a resource that the factory enforces on delete/save.

## Why deferred

Single-owner resources today — the type-the-name delete confirmation ([resource page parity](/docs/resource/resource-page-parity)) and the [recycle bin](/docs/resource/recycle-bin) already cover accidental destruction, which is the entire threat model locks address without collaborators.

## Revisit when

Collaboration ships ([resource collaboration](/docs/resource/deferred/document-collaboration)) — protecting a resource from _other_ editors is when locks earn a column.
