# TypeScript

Most of the `typescript` skill is lint- or typecheck-decided; what this sweep carries is the part that needs a reader — whether two branches are mutually exclusive, whether a cast stands in for a type that could be modelled, whether a signature says what it accepts.

| Unit                                                                                    | Swept | Notes                                                                                 |
| --------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`                               | —     | the widest branch sets in the app                                                     |
| `server/trpc/routers` — the resource family                                             | —     |                                                                                       |
| `server/trpc/routers` — the rest                                                        | —     |                                                                                       |
| `server/services/message`                                                               | —     |                                                                                       |
| `server/services` — the rest, `server/composables`                                      | —     | plus `server/api`, `server/routes`                                                    |
| `app/store/message`                                                                     | —     |                                                                                       |
| `app/store` — the rest                                                                  | —     |                                                                                       |
| `app/composables/message`                                                               | —     |                                                                                       |
| `app/composables/resource`                                                              | —     |                                                                                       |
| `app/composables` — the rest                                                            | —     |                                                                                       |
| `app/services/message`                                                                  | —     |                                                                                       |
| `app/services/resource`                                                                 | —     |                                                                                       |
| `app/services/dungeons`                                                                 | —     | the grid and scene maths, where an index is a coordinate rather than a position       |
| `app/services` — the rest, `app/util`                                                   | —     |                                                                                       |
| `app/models`, `app/shared`                                                              | —     | a discriminated union here is the `zod` ledger's shape; this row reads the TypeScript |
| `app/components/Message`                                                                | —     |                                                                                       |
| `app/components/Resource`                                                               | —     |                                                                                       |
| `app/components` — the rest, `app/pages`, `app/layouts`                                 | —     |                                                                                       |
| `packages/shared`, `packages/shared-node`                                               | —     |                                                                                       |
| `packages/db`, `packages/db-schema`                                                     | —     |                                                                                       |
| `packages/azure`, `packages/azure-mock`, `packages/azure-functions`, `packages/db-mock` | —     |                                                                                       |
| `packages/virrun` — `services/exec`                                                     | —     |                                                                                       |
| `packages/virrun` — the rest                                                            | —     |                                                                                       |
| `packages/infra`, `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`      | —     |                                                                                       |
| `packages/configuration`, `scripts`                                                     | —     |                                                                                       |

## The find recipe

The chain candidates — a guard whose next statement at the same indent is another guard or the fall-through return. Roughly one in four is a chain; the rest are guards over different subjects, or guards each depending on the one above having passed, which the rule keeps split.

```bash
rg -U --pcre2 '^(\s*)if \(.*\) return .*;\n\1(if \(.*\) return .*;|return .*;)' -g '*.ts' -g '*.vue' packages scripts
```

## Exclusions

- **`packages/app/content/docs`** — prose, and the `docs` ledger's.
- **`*.test.ts`, `*.bench.ts`** — the `testing` ledger reads them against its own skill, which states where a suite may diverge from these rules.

## Next enforceable

- **`[...iterable].map(fn)` → `Array.from(iterable, fn)`** — the _shape_ is decidable from the syntax alone: a
  `.map` whose callee object is an array literal holding one spread element. The **equivalence** is not, in two
  ways a selector cannot see. The spread drains the iterable before a single callback runs, where `Array.from`
  interleaves them, so a stateful iterator whose callback advances it yields a different array. And `.map` passes
  `(value, index, array)` where `Array.from` passes `(value, index)`, so a callback reading its third parameter
  changes meaning. A `no-restricted-syntax` selector still takes the shape — ratcheted onto the swept paths
  first — but each site is rewritten by reading it: an iterable with no state of its own and a callback of at
  most two parameters becomes `Array.from(iterable, fn)`, and anything else keeps its evaluation order as
  `Array.from(iterable).map(fn)`.
