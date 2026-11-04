# tsrslint type-aware lint

## Why

Deferred — running the type-aware lint pass on tsrs's own `tsrs-lint`, a Rust port of tsgolint. It lints a sample about twice as fast and runs on Windows, but `tsrs --lint` cannot read the three packages whose tsconfig carries a content mapper. Its argument is in `design.md`.

## What Changes

No change is made yet. The argument and the condition for picking the swap up again are in `design.md`; promoting it means relocating this folder under `openspec/changes/`.
