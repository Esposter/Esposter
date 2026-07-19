---
title: Storage usage surface
description: Deferred — showing a user how much blob storage their resources consume (Azure cost-analysis parity).
---

# Storage usage surface

Azure cost-analysis parity, scaled down: show per-resource and total blob storage consumption (content + published snapshots + uploaded assets) on the Overview blade and Home.

## Why deferred

There are no quotas and no billing, so the number drives no decision; computing it means enumerating `{id}/` blob directories per resource (or maintaining size bookkeeping on every write) for display value only.

## Revisit when

Storage quotas or any per-user limit become real (public signups, abuse concerns), or [publish history](/docs/platform/publish-history) retention makes snapshot growth worth seeing.

## Cheaper interim

Azure portal metrics on the storage account answer the operator-level question today.
