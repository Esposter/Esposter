# Test trimming

Tests that cannot fail for a reason anyone cares about, and fixtures written more than once. What earns a line and what is deleted on sight: `testing`, "What to Test" and "Shared Test Data".

| Unit                                        | Swept      | Notes                                                                           |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `app/app/services`                          | 2026-08-12 | 109; navigation-item, column-statistics and csv/json file fixtures now shared   |
| `app/app/composables`                       | 2026-08-12 | 73; `createPendingQuery` now backs both pagination data-map suites              |
| `app/app/store`, `app/app/models`           | —          | 46                                                                              |
| `app/app/components`, `app/app/util`        | —          | 50                                                                              |
| `app/server`                                | —          | 94                                                                              |
| `app/shared`                                | 2026-08-12 | 24; the schema suites test composed refinements, not Zod                        |
| `virrun`                                    | —          | 155, split further if a pass cannot read it                                     |
| `azure-functions`, `azure-mock`, `db*`      | 2026-08-12 | 68; the EventGrid handler matrix now sits on its factory                        |
| `parse-tmx`, `vue-phaserjs`, `xml2js`, rest | 2026-08-12 | plus `shared`, `shared-node`, `configuration`, `infra`; `createMention` hoisted |

## Exclusions

- Coverage thresholds are not a reason to keep a test — a number that only holds because a test restates a constant is measuring nothing.
