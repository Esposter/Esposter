# Pass-through helpers

Helpers that absorb no decision — the caller still hand-writes every argument, and forgetting one is exactly as easy as it was inline. Rule and the test it has to pass: `file-organization`, "an extraction earns its existence".

| Unit                              | Swept      | Notes                                                                                      |
| --------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `app/services`                    | 2026-08-12 | `readDevices`, `getObjectLayer`                                                            |
| `app/utils`, `app/composables`    | 2026-08-12 | `useGlobalTheme`; `useVTheme().global` is the inline form                                  |
| `shared/services`, `shared/utils` | 2026-08-12 | nothing to remove                                                                          |
| `server/services`, `server/trpc`  | 2026-08-12 | the two `getPartitionKeyFilter` wrappers stay — one definition per Azure partition         |
| `packages/*/src` outside `app`    | 2026-08-12 | `@esposter/db` `deleteEntity`, `getQueueClient`; SDK constructor wrappers are the boundary |

## Find recipe

```bash
# One-statement exported functions — the shape a forwarding wrapper takes
rg -U --multiline-dotall -n 'export const \w+ = (async )?\([^)]*\) =>\s*\w+\([^;]*\);\n' --glob '!*.test.ts'
```

The grep only narrows; the call sites decide. A one-liner that supplies a constant, fixes an argument order, or names a domain concept its callers would otherwise restate is doing work and stays.

## Exclusions

- Wrappers whose sole purpose is the alias boundary a package export needs.
- `create*` factories — they close over state, which is a decision the caller cannot forget.

## Next enforceable

An exported arrow whose whole body is one call passing exactly its own parameters, in order, adding no constant and no type narrowing — mechanically decidable, so a custom oxlint plugin could take it (`oxlint`, `references/custom-js-plugins.md`). Every wrapper this sweep kept needed a judgement that rule cannot make.
