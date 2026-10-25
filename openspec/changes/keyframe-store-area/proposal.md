# Keyframe Store Area

## Why

`keyframe-store` is a published npm package with its own README, and it has no area under `openspec/specs/`. Its behaviour is split between [compression](../../specs/architecture/compression/design.md), which says why the codec is zstd, and [resource version store](../../specs/resource/resource-version-store/design.md), which says how the app keeps versions with it. Neither page states the object format, or the write, read and collection rules a consumer of the package relies on. The package's own README holds the object format as its How it works section, which an npm reader sees, where no spec can check it. A library another project could install gets an area, as `parse-tmx` and `trpc-msw` have ([page shapes](../../specs/architecture/README.md)). This is gap 11 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## What Changes

The package gets an area, `openspec/changes/keyframe-store-area/specs/keyframe-store/`, with an index and two capability pages.

- **`keyframe-store/object-format`**: what an object is on disk. Its address, its keyframe and delta forms, the promotion ratio and segment budget that choose between them, the header that a stranger's bytes are refused by, and the hash check every read makes.
- **`keyframe-store/version-store`**: the contract a caller writes and reads through. The anchor it passes, the base a write reports, the two-read reconstruction, the collection rule and the backend contract.
- The package README keeps the install page: its intro, Getting Started, Key exports and Commands. Its How it works section moves to the area, and the compression and resource version store pages point at the object format page rather than at the README.
- No code changes. Every requirement is already built, and tests that do not yet exist are named in the tasks.
- **Capabilities:** `keyframe-store/object-format` (new), `keyframe-store/version-store` (new).

## Capabilities

- **keyframe-store/object-format** (new)
- **keyframe-store/version-store** (new)

## Waiting on

None.

## Impact

- `openspec/changes/keyframe-store-area/specs/keyframe-store/`, a new area with its index.
- `packages/keyframe-store/README.md`, whose How it works section is replaced by a pointer.
- `openspec/specs/architecture/compression/design.md` and `openspec/specs/resource/resource-version-store/design.md`, which point at the object format page instead of the README.
- No package code, no manifest, no migration.
