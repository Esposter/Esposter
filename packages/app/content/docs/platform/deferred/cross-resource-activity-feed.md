---
title: Cross-resource activity feed
description: Deferred — a Home-level feed aggregating activity across all of a user's resources.
---

# Cross-resource activity feed

Azure's subscription-level Activity log: one feed on Home aggregating events (published, imported, saved) across all of a user's resources, instead of per-resource only.

## Why deferred

The [activity log](/docs/platform/activity-log) partitions by resource id (`partitionKey = resourceId`) — the right shape for the per-resource blade, the wrong shape for a cross-partition feed. Aggregating needs either a second user-keyed table written in parallel or cross-partition queries; both are real cost for a feed whose content the owner generated themselves (you know what you did).

## Revisit when

The per-resource activity blade ships and multi-resource workflows make "what changed lately across everything" a question users actually ask — or collaboration lands, at which point the feed shows _other people's_ actions and earns the second table.

## Cheaper interim

Home's recents list approximates "what did I touch lately"; the per-resource blade answers the deep question.
