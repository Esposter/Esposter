# TypeScript

Most of the `typescript` skill is lint- or typecheck-decided; what this sweep carries is the part that needs a reader — whether two branches are mutually exclusive, whether a cast stands in for a type that could be modelled, whether a signature says what it accepts.

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status typescript` says where each unit stands. It keeps an area file only for the units it holds a note on: [app-shell](app-shell.md), [dungeons](dungeons.md), [messaging](messaging.md), [products](products.md), [resource](resource.md), [server](server.md) and [shared](shared.md). A pass loads this file, the unit's bullet in the list and this ledger's file for the area where it has one.

## The find recipe

The chain candidates — a guard whose next statement at the same indent is another guard or the fall-through return. Roughly one in four is a chain; the rest are guards over different subjects, guards each depending on the one above having passed, or a fall-through that carries the happy path — a block, or a `return` with a body of its own — all of which the rule keeps split. A one-`return` guard over a one-`return` fall-through is the pair that takes its `else`, a formatter wrap included.

```bash
rg -U --pcre2 '^(\s*)if \(.*\) return .*;\n(\1//.*\n)*\1(if \(.*\) return .*;|return .*;)' -g '*.ts' -g '*.vue' apps packages scripts
```

The comment group is load-bearing: a line of prose between the guard and the fall-through return hides a
chain from the pattern without it, and a guard is exactly where this codebase writes prose.

## Exclusions

- **`apps/web/shared/generated`** — generated output, rewritten by its generator rather than by hand.
- **`*.test.ts`, `*.bench.ts`** — the `testing` ledger reads them against its own skill, which states where a suite may diverge from these rules.
