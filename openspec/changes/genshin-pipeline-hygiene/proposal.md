# Genshin pipeline hygiene

## Why

Once every output carries a stamp, the pipeline still writes files a second machine cannot use. Exports and records hold the path of the machine that wrote them, some records have no writer or have two, and the fits write into the world data folder that people edit. A re-extraction keeps the files of earlier runs, the fleet copy decides by size and time, and `genshin:data verify` never reads the lock it is meant to check.

## What Changes

Exports and records hold only paths relative to the data root, and each record is registered once, with the one command that writes it. Each fit writes its record and its report into the records folder, and a refit refuses a record whose hash has changed since its report was made. A writer clears the folders it owns before it writes, the fleet copy decides each file by its content, and verify fails when the generated lock differs from the committed one.

## Capabilities

- **genshin/pipeline-hygiene** (new)

## Waiting on

Task 3.1 waits on task 1.2 of [genshin-pipeline-provenance](../genshin-pipeline-provenance/proposal.md), which stamps each fit's output. No other task waits on a sister change.

## Impact

The data root and the derived paths under `scripts/src/services/genshinAssets`, the record table and the parity commands under `scripts/src/services/genshinParity`, the placement of the tools, the fleet copy, the game-data publish and verify, the catalogue reader under `packages/genshin-world/src/services`, and the parity folder's manifest. None of its tasks names the PC or the install in its text.
