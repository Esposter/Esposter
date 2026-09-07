---
title: Remote cache sharing
description: Share warm snapshots or task-cache entries across machines, Turborepo-remote-cache style.
---

# Remote cache sharing

Upload/download warm snapshots or task-cache entries to a shared remote (blob storage, a registry), so a second machine — or a CI runner — skips the cold install or replays a teammate's recorded run instead of re-executing.

**Why deferred:** Every current consumer is a single dev machine, and both caches are deliberately local levers: CI keeps the task cache off by design (fresh commit → ~0 hits), and the CI runners resolve `native` anyway, so there is no second machine to share with today. The costs are real: a snapshot upper is multi-GB (transfer can exceed the install it saves), overlay uppers carry host-specific metadata (whiteouts, xattrs) that must survive round-tripping, and replaying another machine's recorded run makes cache poisoning a correctness _and_ security surface that the current same-machine trust model simply doesn't have.

**Revisit when:** virrun has multi-machine consumers with a shared trust boundary — a team on the same repo where cold installs are a measured recurring cost, or a CI topology where a warm snapshot artifact demonstrably beats the pnpm store cache the Linux runners already use.

**Cheaper interim:** `virrun warm` provisions the local warm cache ahead of time; CI's pnpm store cache covers the runner side.
