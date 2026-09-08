# TypeScript

Most of the `typescript` skill is lint- or typecheck-decided; what this sweep carries is the part that needs a reader — whether two branches are mutually exclusive, whether a cast stands in for a type that could be modelled, whether a signature says what it accepts.

| Unit                                                                                            | Swept      | Notes                                                                                 |
| ----------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`                                       | 2026-09-07 | the widest branch sets in the app                                                     |
| `server/trpc/routers` — the resource family                                                     | 2026-09-07 |                                                                                       |
| `server/trpc/routers` — the rest                                                                | 2026-09-07 |                                                                                       |
| `server/services/message`                                                                       | 2026-09-07 |                                                                                       |
| `server/services/resource`                                                                      | —          | the snapshot and rollback paths                                                       |
| `server/services/room`, `friend`, `user`, `role`, `achievement`                                 | —          | membership and the social graph                                                       |
| `server/services/survey`, `dataset`, `program`                                                  | —          | the response and reporting path                                                       |
| `server/services/blueprint`, `storage`, `blobState`, `notification`, `dashboard`, `emailEditor` | —          |                                                                                       |
| `server/services/auth`, `livekit`, `rateLimiter`, `request`                                     | —          |                                                                                       |
| `server/services/azure`, `pagination`, `db`, `events`, `post`                                   | —          |                                                                                       |
| `server/trpc` — everything outside `routers`                                                    | —          | context, procedure builders, middleware                                               |
| `server/composables`, `server/api`, `server/routes`                                             | —          |                                                                                       |
| `server/models`, `server/db`, `server/plugins`, `server/auth.ts`                                | —          |                                                                                       |
| `app/store/message`                                                                             | —          |                                                                                       |
| `app/store` — the rest                                                                          | —          |                                                                                       |
| `app/composables/message`                                                                       | —          |                                                                                       |
| `app/composables/resource`                                                                      | —          |                                                                                       |
| `app/composables` — the rest                                                                    | —          |                                                                                       |
| `app/services/message`                                                                          | —          |                                                                                       |
| `app/services/resource`                                                                         | —          |                                                                                       |
| `app/services/dungeons`                                                                         | —          | the grid and scene maths, where an index is a coordinate rather than a position       |
| `app/services` — the rest, `app/util`                                                           | —          |                                                                                       |
| `app/models`, `app/shared`                                                                      | —          | a discriminated union here is the `zod` ledger's shape; this row reads the TypeScript |
| `app/components/Message`                                                                        | —          |                                                                                       |
| `app/components/Resource`                                                                       | —          |                                                                                       |
| `app/components` — the rest, `app/pages`, `app/layouts`                                         | —          |                                                                                       |
| `packages/shared`, `packages/shared-node`                                                       | —          |                                                                                       |
| `packages/db`, `packages/db-schema`                                                             | —          |                                                                                       |
| `packages/azure`, `packages/azure-mock`, `apps/functions`, `packages/db-mock`                   | —          |                                                                                       |
| `packages/virrun` — `services/exec`                                                             | —          |                                                                                       |
| `packages/virrun` — the rest                                                                    | —          |                                                                                       |
| `apps/infra`, `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`                  | —          |                                                                                       |
| `packages/configuration`, `scripts`                                                             | —          |                                                                                       |

## The find recipe

The chain candidates — a guard whose next statement at the same indent is another guard or the fall-through return. Roughly one in four is a chain; the rest are guards over different subjects, or guards each depending on the one above having passed, which the rule keeps split.

```bash
rg -U --pcre2 '^(\s*)if \(.*\) return .*;\n(\1//.*\n)*\1(if \(.*\) return .*;|return .*;)' -g '*.ts' -g '*.vue' apps packages scripts
```

The comment group is load-bearing: a line of prose between the guard and the fall-through return hides a
chain from the pattern without it, and a guard is exactly where this codebase writes prose.

## Next enforceable

`typescript/consistent-type-imports`, off in `.oxlintrc.json`. A class used only in type position takes
`import type` everywhere but the odd file, so the rule would decide it — but it also owns
`disallowTypeAnnotations`, and `vi.mock(import(…))` is the sanctioned Vitest idiom, so it needs that option
off and its own violation sweep before it can be switched on.

Switching it on would decide `.ts` and nothing else: oxlint skips the rule for `.vue`, since it cannot tell
from the script block whether the template uses an import as a value, and nothing in the ESLint config turns it
on there. So the `.vue` rows keep this dimension however `.oxlintrc.json` ends up.

## Exclusions

- **`apps/web/content/docs`** — prose, and the `docs` ledger's.
- **`*.test.ts`, `*.bench.ts`** — the `testing` ledger reads them against its own skill, which states where a suite may diverge from these rules.
