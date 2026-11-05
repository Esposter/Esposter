# Genshin pipeline acceptance

## Why

The macOS decoder has never been shown to match the Windows one: its file counts are not recorded beside the build, and the game-running guard reports the game as absent on macOS. Several hand-set fit constants and measured values rest on nothing a reader can check, and no run has shown that a fresh PC and Mac pair publish the same lock.

## What Changes

The macOS AnimeStudio build is accepted only when its file count for each reference block equals the count committed for the Windows build. The game-running guard reads the process list on macOS too. Every hand-set fit constant and every value measured from a capture moves into a measurement file that names the capture and the frame, and a reader refuses an entry that names none. The owning pages are carried with the code they describe, and a fresh PC and Mac pair runs the pipeline to its publish and publishes the same lock.

## Capabilities

- **genshin/pipeline-acceptance** (new)

## Waiting on

Task 1.1 waits on tasks 2.4 and 3.1 of [genshin-pipeline-provenance](../genshin-pipeline-provenance/proposal.md). The owning pages and the reproduction run wait on the last task of each sister change, task 3.4 of the provenance change and task 4.3 of [genshin-pipeline-hygiene](../genshin-pipeline-hygiene/proposal.md).

## Impact

The AnimeStudio build and its parity check under `scripts/src/services/recreation/animeStudio` and `scripts/src/services/genshinAssets`, the game-running guard under `scripts/src/services/genshinParity`, the measured values under `packages/genshin-world/src/services`, the parity folder's counts and measurements, and the owning pages under `openspec/specs`. The tasks that name the PC are the decoder counts and the reproduction run, and the reproduction run also needs a Mac with the install.
