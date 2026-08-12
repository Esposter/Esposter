# Pass-through helpers

Helpers that absorb no decision — the caller still hand-writes every argument, and forgetting one is exactly as easy as it was inline. Rule and the test it has to pass: `file-organization`, "an extraction earns its existence".

**Enforced since 2026-08-12** by `pass-through-helper/no-forwarding-wrapper` (`scripts/oxlint/passThroughHelper.ts`), so nothing here needs re-running: a new forwarding wrapper fails the lint on the line that wrote it. The rule is off for `*.test.ts`/`*.bench.ts`, where a colocated double mirrors a real signature on purpose.

| Unit                              | Swept      | Notes                                                                       |
| --------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `app/services`                    | 2026-08-12 | `readDevices`, `getObjectLayer`                                             |
| `app/utils`, `app/composables`    | 2026-08-12 | `useGlobalTheme`; `useVTheme().global` is the inline form                   |
| `shared/services`, `shared/utils` | 2026-08-12 | nothing to remove                                                           |
| `server/services`, `server/trpc`  | 2026-08-12 | both `getPartitionKeyFilter` wrappers inlined at their five call sites      |
| `packages/*/src` outside `app`    | 2026-08-12 | `deleteEntity`, `getQueueClient`, `getWebPubSubServiceClient`, xml2js's two |

## Exclusions

- `create*` factories — they close over state, which is a decision the caller cannot forget.

## Rejected reasons to keep one

Each was argued for a real wrapper here and turned down, so the rule carries no production suppression:

- **A package boundary.** `@esposter/db`'s `getWebPubSubServiceClient` existed so only that package imported `@azure/web-pubsub`; both consumers already depended on it directly.
- **A single definition point.** The program-participant and survey-response filters were each "the one definition" a capped read and its count agree on. Both were one `getPartitionKeyFilter` call, and inlining them changed nothing about that agreement.
- **Upstream API parity.** xml2js's `normalize` and `firstCharLowerCase` mirrored the published upstream names. The package is a rewrite, not a drop-in, so the names went.
