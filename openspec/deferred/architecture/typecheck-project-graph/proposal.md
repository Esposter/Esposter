# Typecheck project graph

## Why

Deferred — checking every package with one `tsrs -b` over a root solution tsconfig, in place of one `tsrs --fast` process per package under `pnpm -r --parallel`. A cold run is slower than the per-package processes, the saving it buys is incremental and CI never runs warm, and three Vue packages could not join it as configured. Its argument and the conditions that bring it back are in `design.md`.

## What Changes

No change is made yet. The argument, the measurement protocol and the condition for picking the idea up again are in `design.md`; promoting it means relocating this folder under `openspec/changes/`.
