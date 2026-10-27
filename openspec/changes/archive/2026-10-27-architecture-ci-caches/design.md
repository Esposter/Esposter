# CI caches — design of the change

The mechanism is written in `openspec/specs/architecture/ci-caches/design.md`, which this change rewrites as built. This page keeps only the choice the change made and what it turned down.

## Decision

A cache is saved from the default branch and `ai/queue` alone. Every other branch reads. A store or mirror is keyed on the lockfile or the lock's contents, so a save happens only when that key is new.

## Alternatives turned down

- **Keep saving from every branch and prune.** Pruning only postpones the eviction: each branch still writes a store of several hundred megabytes on each run, and the cap is reached again within a day of busy runs.
- **Gate the pnpm store with `save-cache` on `pnpm/setup`.** That input turns the save off or on for the whole run, decided before the restore is known, so it cannot save on a miss only. Its key also carries the run identifier, so an enabled save still writes on every run. The store is keyed here instead.
- **Save from `main` alone.** `main` moves on the review's fast-forward, so `ai/queue` would fill the lock's difference from the dev account on each run until `main` caught up.
