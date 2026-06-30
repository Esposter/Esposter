Rewrite virrun's own orchestration/IO (source load, overlay-manifest classification, flush planning, lockfile hashing) in Rust via napi to "run it at native speed."

## Why not

virrun is an orchestrator, not a compute engine — it barely runs hot JS. Every benchmarked number is dominated by (a) the child toolchain process it spawns (pnpm/tsgo/rolldown/vitest) and (b) filesystem + bubblewrap-namespace IO. virrun's own TS (`buildFlushPlan`, `parseOverlayManifest`, `computeLockfileHash`, `loadFilesSource`) runs in microseconds-to-low-ms against multi-second children, so rewriting it in Rust shaves noise off a number set by code virrun does not control. napi also does not make existing JS faster — it lets you call Rust _from_ Node — so the premise ("run JS at Rust speed") is a category error here.

The "Rust speed" win is real but lives one layer up: swap the slow JS tools for their native rewrites. The repo already does this — oxlint (Rust), rolldown (Rust), oxfmt (Rust), tsgo (Go) — and virrun's job is to run those isolated + warm, not to be fast itself. The architectural levers (RAM overlay, warm-fork, expanding the in-process `vfs` backend) dwarf any orchestration-language gain.

## Revisit when

A profile of a real `virrun --` run shows a CPU-bound hotspot _in virrun's own code_ that is a material fraction of wall-clock — realistically only a parallel directory walk+read for the in-memory `vfs`/`files` source over a huge tree (Rust `jwalk`/`rayon`). The `os` backend hot path never touches that code, so prove it matters there first.
