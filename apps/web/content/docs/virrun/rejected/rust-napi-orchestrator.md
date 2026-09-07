---
title: Rust/napi orchestrator
description: Rewrite virrun's own orchestration and IO in Rust via napi to run it at native speed.
---

# Rust/napi orchestrator

Rewrite virrun's own orchestration/IO (source load, overlay-manifest classification, flush planning, lockfile hashing) in Rust via napi to "run it at native speed."

**Why not:** virrun is an orchestrator, not a compute engine — it barely runs hot JS. Every benchmarked number is dominated by (a) the child toolchain process it spawns (pnpm/tsc/rolldown/vitest) and (b) filesystem + bubblewrap-namespace IO. virrun's own TS (`buildFlushPlan`, `parseOverlayManifest`, `computeLockfileHash`) runs in microseconds-to-low-ms against multi-second children, so a Rust rewrite shaves noise off a number set by code virrun does not control. napi also does not make existing JS faster — it lets you call Rust _from_ Node — so the premise is a category error here.

The "Rust speed" win is real but lives one layer up: swap the slow JS tools for their native rewrites. The repo already does this — oxlint, rolldown, oxfmt (Rust), tsc via typescript-native-bridge (Go) — and virrun's job is to run those isolated + warm, not to be fast itself. Revisit only if a profile of a real run shows a CPU-bound hotspot in virrun's own code that is a material fraction of wall-clock — realistically only a parallel directory walk for a huge in-memory source tree, which the `os` backend hot path never touches.
