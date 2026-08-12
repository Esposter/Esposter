# Pass-through helpers

Helpers that absorb no decision — the caller still hand-writes every argument, and forgetting one is exactly as easy as it was inline. Rule and the test it has to pass: `file-organization`, "an extraction earns its existence".

| Unit                              | Swept | Notes                                  |
| --------------------------------- | ----- | -------------------------------------- |
| `app/services`                    | —     |                                        |
| `app/utils`, `app/composables`    | —     |                                        |
| `shared/services`, `shared/utils` | —     |                                        |
| `server/services`, `server/trpc`  | —     |                                        |
| `packages/*/src` outside `app`    | —     | one commit per package, smallest first |

## Find recipe

```bash
# One-statement exported functions — the shape a forwarding wrapper takes
rg -U --multiline-dotall -n 'export const \w+ = (async )?\([^)]*\) =>\s*\w+\([^;]*\);\n' --glob '!*.test.ts'
```

The grep only narrows; the call sites decide. A one-liner that supplies a constant, fixes an argument order, or names a domain concept its callers would otherwise restate is doing work and stays.

## Exclusions

- Wrappers whose sole purpose is the alias boundary a package export needs.
- `create*` factories — they close over state, which is a decision the caller cannot forget.
