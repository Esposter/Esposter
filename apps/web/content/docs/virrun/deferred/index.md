---
title: Deferred
description: Ideas virrun chose not to build yet — each with the concrete trigger that would revisit it.
---

# Deferred

Ideas we chose not to build yet. One page per idea; each states why and the concrete trigger that would revisit it. Check here (and [rejected](/docs/virrun/rejected)) before proposing an idea — never re-argue a decided one.

- [Prepare layer narrow key](/docs/virrun/deferred/prepare-layer-narrow-key) — stop re-keying the `.nuxt` regen on every source edit; blocked on a provably safe input predicate.
- [Additional isolation targets](/docs/virrun/deferred/additional-isolation-targets) — macOS bridge (Linux VM) + Firecracker microVM backend.
- [Snapshot upper on tmpfs](/docs/virrun/deferred/snapshot-upper-tmpfs) — warm forks read `node_modules` from RAM instead of a disk-backed lower.
- [Whole-repo routing](/docs/virrun/deferred/whole-repo-routing) — one switch instead of per-command prefixing.
- [WASM runtime backend](/docs/virrun/deferred/wasm-runtime) — zero host setup, no native addons.
- [Native task-cache recording](/docs/virrun/deferred/native-task-cache) — task-cache entries without the os sandbox.
- [Remote cache sharing](/docs/virrun/deferred/remote-cache-sharing) — share warm snapshots / task-cache entries across machines.
- [Non-pnpm package managers](/docs/virrun/deferred/non-pnpm-package-managers) — npm/yarn dep stores and installs in the sandbox.
