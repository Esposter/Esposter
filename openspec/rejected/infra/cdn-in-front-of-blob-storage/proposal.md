# CDN in front of Blob storage

## Why

Putting Azure Front Door or another CDN in front of the Blob account that serves the game's data, so its immutable objects are cached at the edge instead of read from storage.

## What Changes

Nothing: this idea is rejected. Its argument is in `design.md`.
