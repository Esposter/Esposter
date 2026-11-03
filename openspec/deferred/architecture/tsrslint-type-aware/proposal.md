# tsrslint type-aware lint

## Why

Deferred — running the type-aware lint pass on `@maschwenk/tsrslint`, a Rust port of tsgolint on tsrs. On Linux it lints the packages tree about three times faster in about half the memory, but it cannot read the three packages whose tsconfig carries a content mapper, and it ships no Windows binary. Its argument is in `design.md`.

## What Changes

No change is made yet. The argument and the condition for picking the swap up again are in `design.md`; promoting it means relocating this folder under `openspec/changes/`.
