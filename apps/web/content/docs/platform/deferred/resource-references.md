---
title: Resource references
description: Deferred — a maintained reference index answering "what consumes this resource" (which dashboards, emails, or imports point at it).
---

# Resource references

A reference index over cross-resource links: which dashboards bind this Sheet, which emails merge from this survey's responses, which resources this one consumes — surfaced as a "Referenced by / References" panel on the Overview blade. Today every link is a bare `DatasetReference` (or survey id) buried inside consumers' content blobs, so answering "is anything using this?" means scanning every blob.

## Why deferred

Links-by-id with re-resolve-on-load is a deliberate design ([resource explorer](/docs/platform/resource-explorer) — delete leaves consumers failing soft, never cascading). A reference index is a second source of truth that must be updated on every content save by parsing type-specific content shapes — real machinery, easy to let drift, for a lineage view nobody has asked for at current resource counts (a user's `/all` list fits on one screen).

## Revisit when

[Dangling dataset references](/docs/platform/deferred/dangling-dataset-references) gets built — a delete-time "this resource is used by N others" warning needs exactly this index, and the two should be designed together — or resource counts grow past what an owner can hold in their head.
