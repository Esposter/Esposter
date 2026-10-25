# Shared Node Capabilities

## Why

`@esposter/shared-node` holds three parts the repo depends on every day: a machine-wide download cache, the hidden-window child process wrappers, and the benchmark reporting that writes each bench's committed results. None of them is described in any spec under `openspec/specs/`. A session that changes the cache has no record of the rules it keeps, such as a name that is never read from outside the cache directory, or a download kept only when its bytes match its name. The package's only spec mention is in [hosted game data](../../../specs/genshin/hosted-game-data/design.md), which is outside this survey. This is gap 13 of the [gap survey](../2026-10-25-gap-survey-2026-10-25/proposal.md).

## What Changes

Three capability pages under `openspec/specs/architecture/`, one for each part of the package. The package serves the repo rather than an installed product, so it has no area of its own, and its capability pages describe it ([page shapes](../../../specs/architecture/README.md)).

- **`architecture/download-cache`**: a download read through a cache keyed by the SHA-256 of its bytes.
- **`architecture/hidden-child-processes`**: the five child process wrappers, which keep a console window from opening on Windows, and the lint rule that makes them the only way in.
- **`architecture/benchmark-reporting`**: the reporter that writes each bench's Markdown and JSON reports beside its source, and the report's contents.
- The architecture index gains a line for each page when this ships.
- No code changes. Every requirement is built, and the tests that name each scenario already exist, except where the tasks name one to write.
- **Capabilities:** `architecture/download-cache`, `architecture/hidden-child-processes`, `architecture/benchmark-reporting` (all new).

## Capabilities

- **architecture/download-cache** (new)
- **architecture/hidden-child-processes** (new)
- **architecture/benchmark-reporting** (new)

## Waiting on

None.

## Impact

- `openspec/specs/architecture/`, three new capability folders and the architecture index.
- No package code, no manifest, no dependency.
