---
title: Non-pnpm package managers
description: npm/yarn dep stores and installs in the sandbox, for the generic-any-repo goal.
---

# Non-pnpm package managers

Support npm and yarn repos in the sandbox: their own shared dep-store wiring (npm cache / yarn cache), lockfile hashing (`package-lock.json` / `yarn.lock`) for the snapshot key, and correctness coverage for their install layouts.

**Why deferred:** The generic-any-repo goal implies it eventually, but every current consumer is pnpm: the dep store is pnpm-specific (`.virrun/store/pnpm`, pnpm env wiring), `computeLockfileHash` reads `pnpm-lock.yaml`, and the differential/equivalence corpora exercise pnpm installs. Each added manager multiplies the correctness matrix (managers × native deps × cache states × hosts) — a real ongoing gate surface with no consumer to pay for it. The sandbox itself is manager-agnostic (bwrap runs any process); only the cache/key plumbing is pnpm-shaped.

**Revisit when:** An external consumer repo on npm or yarn wants virrun — the store/lockfile seams get abstracted then, driven by a real install to gate against.

**Cheaper interim:** An npm/yarn repo can still run non-install commands sandboxed today; only the warm-snapshot install path and its keying assume pnpm.
