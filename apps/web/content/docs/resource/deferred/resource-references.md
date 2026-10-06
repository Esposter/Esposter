---
title: Resource references
description: Deferred — a "Referenced by / References" panel on the Overview blade, listing which resources consume this one and which it consumes.
---

# Resource references

A "Referenced by / References" panel on the Overview blade: which dashboards chart this Sheet, which emails merge from this survey's responses, which Program issues this survey's tokens — and, the other way, everything this resource consumes. Each row is a link to the other resource, labelled by its type and the role the link plays.

The data is already there: every cross-resource reference is indexed by source, role and target in the [resource-link index](/docs/architecture/resource-links), so the panel is one indexed read each way joined to the resource rows, with a deleted target shown as unavailable rather than hidden.

## Why deferred

It is a lineage view nobody has asked for at current resource counts — a user's `/all` list fits on one screen, and the consumers of one resource are usually the ones its owner just built. The index cost that once came with it is paid, so what remains is UI on the Overview blade, a resource-scoped read procedure for it, and one backfill: a resource not saved since the index shipped holds no `Dataset` or `Email` links yet, so building the panel starts by projecting every Program, Dashboard and Email blob into the index on each database.

## Revisit when

[Dangling dataset references](/docs/resource/deferred/dangling-dataset-references) gets built — a delete-time "this resource is used by N others" warning reads the same rows, and the panel is the natural place to show them — or resource counts grow past what an owner can hold in their head.
