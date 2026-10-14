---
title: Roadmap
description: Open cross-cutting work — each item a decision or a feature the build loop takes.
---

# Roadmap

Open work for the cross-cutting standards on this section, each item a decision or a feature. An idea waiting on a revisit trigger is parked in [deferred](/docs/architecture/deferred).

## Open

- [ ] **A duplicate-code gate in CI, at a zero threshold.** No workflow runs jscpd, so nothing fails on a duplicate: the sweep's finder (`scripts/src/sweeps/duplicateCode/index.ts`) prints rather than exits non-zero, and jscpd's default threshold is unset. The finder still reports pairs, and the duplicate-code ledger (`.agents/ledgers/quality/duplicate-code.md`) still has open units. When the sweep reaches zero, add `kucherenko/jscpd` pinned to a commit SHA with `threshold: 0`, and give its `.jscpd.json` the finder's ignore globs, tests and import blocks included, so the gate and the sweep count the same code.
