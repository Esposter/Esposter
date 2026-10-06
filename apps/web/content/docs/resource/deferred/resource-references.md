---
title: Resource references
description: Deferred — a "Referenced by / References" panel on the Overview blade, listing which resources consume this one and which it consumes.
---

# Resource references

A "Referenced by / References" panel on the Overview blade: which dashboards chart this Sheet, which emails merge from this survey's responses, which Program issues this survey's tokens — and, the other way, everything this resource consumes. Each row is a link to the other resource, labelled by its type and the role the link plays.

The data is already there: every cross-resource reference is indexed by source, role and target in the [resource-link index](/docs/architecture/resource-links), so the panel is one indexed read each way joined to the resource rows, with a deleted target shown as unavailable rather than hidden.

## Why deferred

It is a lineage view nobody has asked for at current resource counts — a user's `/all` list fits on one screen, and the consumers of one resource are usually the ones its owner just built. The one moment those consumers matter is a delete, and the [delete-time reference warning](/docs/resource/delete-reference-warning) already names them there through `readResourceConsumers`, the read the panel's "Referenced by" half would reuse. What remains is UI on the Overview blade and a read of the other direction, by source.

## Revisit when

Resource counts grow past what an owner can hold in their head, or an owner asks what a resource feeds outside of deleting it.
