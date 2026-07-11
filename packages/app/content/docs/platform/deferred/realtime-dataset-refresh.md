---
title: Realtime dataset refresh
description: Deferred — bound dashboard visuals updating live as new survey responses arrive.
---

# Realtime dataset refresh

Bound dashboard visuals updating live as new survey responses arrive (tRPC subscription per bound dataset).

## Why deferred

Fetch-on-load + manual refresh covers the review workflow; live updates matter mostly for a "watch results come in" moment. Wiring subscriptions through the dataset layer (emitter per provider, fan-out for published dashboards) is real complexity to add after bindings prove themselves.

## Revisit when

Stale-until-refresh is an observed annoyance with real dashboard bindings, or a live-results view becomes a headline feature.

## Cheaper interim

Manual refresh button; re-open the dashboard.
