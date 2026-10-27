# CI caches save from two branches only

## Why

Dev blob reads for the Genshin game-data mirror were billed heavily over a few weeks, and the caches were not doing what they were meant to. Every branch that ran CI saved its own copies: the pnpm store on each run, a per-run task cache, and the mirror under each branch's own key. GitHub caps a repository's caches at ten gigabytes and evicts the least recently used, so those copies pushed the mirror out, and the next run downloaded the mirror again from the dev account.

The pnpm store also saved on every run, not only when the lockfile changed, because its key carries the run's identifier and a random suffix that no later run can match.

## What changes

- Caches are saved only from the default branch and `ai/queue`. Every other branch restores the newest cache it can see and saves nothing.
- The pnpm store is keyed on the lockfile's contents, and saved only when that key is missing.
- The game-data mirror is filled and saved only on those two branches; every branch restores it.
- A regression test in `scripts` fails if a workflow or action saves a cache outside that rule, or turns on the pnpm store's own per-run cache.

## Out of scope

Caches written by third-party actions internally (CodeQL's bundle cache, the lockfile verification cache that `pnpm/setup` saves either way). Both are a single small entry, and neither is a save this repository's workflows choose.
