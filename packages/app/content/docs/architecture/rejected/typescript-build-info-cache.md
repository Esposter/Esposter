---
title: TypeScript build info cache
description: Rejected — restoring *.tsbuildinfo across CI runs to make the typecheck job incremental, which cannot be shown correct.
---

# TypeScript build info cache

Restoring each package's `*.tsbuildinfo` would make the typecheck job incremental. Measured locally, that takes the packages from most of two minutes to seconds and roughly halves the app's pass — a real saving in the currency [CI proposals are judged in](/docs/architecture/monorepo-tooling), and it is still refused.

## Why not

**Only a prefix restore saves anything.** An exact-key hit means this tree already typechecked green, which is a marker's answer and needs no compiler to give it.

**A prefix hit cannot be shown correct.** It would be the one gate here whose correctness rests on a compiler's own dependency graph rather than on a hash of its inputs — every other one is checkable by hashing what went in and looking at what came out. TypeScript versions each file by content, so a stale entry still reports an error introduced in a file someone edited; what no sampling establishes is that every _indirect_ invalidation is caught, and the compiler here is a native implementation far younger than the format it writes. Getting it wrong buys a silent green on a gate.

**The ecosystem does not lean on it either.** The monorepo caches people do trust — this repository's own included — key inputs to outputs and never restore a compiler's internal state.

## The revisit trigger

Nothing about the saving; only the proof. A restore whose correctness follows from a hash of inputs rather than from the compiler's invalidation — which is a marker, not this.
