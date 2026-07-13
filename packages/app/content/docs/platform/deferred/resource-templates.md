---
title: Resource templates
description: Deferred — create-from-template gallery entries (sample survey, starter dashboard) per resource type.
---

# Resource templates

Marketplace-style templates in the create flow: pick "NPS survey" or "Sales dashboard" instead of an empty resource, seeding the content blob from a stored template.

## Why deferred

Every type currently creates empty and that is fine for a single-user platform — templates need authored content worth seeding, a place to store it (static JSON per type is easy, user-authored templates are a whole feature), and gallery UI. Value arrives with users who don't want to start from scratch, which is not today's bottleneck.

## Revisit when

New-user onboarding exists as a goal, or one type (Survey is the obvious first) repeatedly needs the same starting structure. Template metadata is also the [gallery search](/docs/platform/deferred/gallery-marketplace-search) revisit trigger — they land together.

## Cheaper interim

[Duplicate](/docs/platform/resource-page-parity) an existing resource and edit the copy.
