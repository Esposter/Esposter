# CDN in front of the asset buckets

## Why

Putting a CDN in front of the R2 bucket that serves the game's data, so its immutable objects are cached at the edge instead of read from storage.

## What Changes

Nothing: this idea is rejected. Its argument is in `design.md`.
