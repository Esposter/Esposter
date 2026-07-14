---
title: Null Removal
description: Eliminate null from all app-owned TypeScript/Vue code in favour of undefined, enforced by ESLint, with carve-outs at the Drizzle and Azure boundaries.
---

# Null Removal

Eliminate `null` from all TypeScript / Vue source in favour of `undefined`, enforced by an ESLint rule. The only accepted carve-outs are the Drizzle ORM / Azure boundary layers, where the external systems own the type.

## Why

- One absent-value sentinel everywhere. `undefined` is already the implicit value for missing object keys, optional parameters, and uninitialised refs; `null` adds no meaning and forces every consumer to handle two sentinels.
- `undefined` composes cleanly with optional chaining (`?.`) and optional properties (`field?:`); `null` does not.
- Removes the entire `=== null` vs `=== undefined` bug class.

## Scope

Nothing is implemented yet — no ESLint rule, no `nullToUndefined` helper. At the last audit, `null` appeared as roughly 70 union-type annotations in Vue refs/composables, 117 literal assignments/returns, 15 `.nullable()` Zod fields across three files, ~6 Azure external-API type members, 26 Drizzle schema files with nullable columns, and ~50 test-fixture values (`deletedAt: null`, `image: null`).

## Carve-outs (keep `null`)

Two areas are owned by external systems; changing them would require a DB migration or fight Azure SDK types. Keep `null` there and convert at the boundary before values enter app code.

1. **Drizzle ORM schema inferences** — nullable columns (`text()` without `.notNull()`) infer as `string | null`. Convert to `undefined` via a thin `nullToUndefined` transform in the select helpers.
2. **Azure Table / EventGrid API types** — `SerializableValue`, `FriendRequestNotificationEventGridData.icon / title`. Keep the raw Azure types as-is; convert on ingress.

Carve-out paths: `packages/db-schema/src/schema/`, `packages/db-schema/src/models/azure/`, and any file that directly re-exports Drizzle column inference.

## Phases

### Phase 1 — ESLint rule (gate)

Add a `no-restricted-syntax` rule in `packages/configuration` erroring on `TSNullKeyword` (null as a type union member) and `null` literals outside carve-out paths. Enable as a **warning** first so existing violations are visible without blocking CI; flip to **error** in phase 7.

### Phase 2 — Boundary helpers

Add `nullToUndefined` in `packages/shared` (`value === null ? undefined : value`) plus a mapped-type helper that recursively converts `T | null` → `T | undefined` for Drizzle select results, applied at the query layer rather than field-by-field. These helpers are the only place `null` may appear in app-owned code going forward.

### Phase 3 — Zod schemas

Replace `.nullable()` with `.optional()` in the three files that use it, then verify all consumers handle `undefined`:

| File                                                      | Fields                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `shared/models/resource/sheet/column/ColumnStatistics.ts` | `average`, `falseCount`, `trueCount`, `min`, `max`, `topFrequencies`, etc. |
| `shared/models/flowchartEditor/data/HandleBounds.ts`      | `source`, `target`                                                         |
| `shared/models/resource/todoList/TodoListItem.ts`         | `dueAt`                                                                    |

`ColumnValue.ts` uses `z.null()` in a union — replace with `z.undefined()` or drop the member if unused. `SerializableValue` in `packages/db-schema/src/models/azure/` stays as-is (carve-out).

### Phase 4 — Vue components & composables

Mechanical replacements: `ref<T | null>(null)` → `ref<T | undefined>()` (undefined is the default), `defineModel<T | null>` → `defineModel<T | undefined>`, `computed<T | null>` → `computed<T | undefined>`. Vuetify's date pickers accept `undefined` for no-selection — `null` is not required (confirm against the Vuetify 4 API on the date-picker components).

### Phase 5 — Literal assignments & returns

After phases 3–4 change the types, most literal sites surface as type errors. Remaining patterns: `foo.value = null` → `= undefined`, `return null` → `return undefined`, drop `?? null` entirely, `!== null` / `=== null` guards → `undefined` checks or `??`.

### Phase 6 — Test fixtures

Update mock row data (`deletedAt: null` → `deletedAt: undefined`, etc.). Fixtures that mimic raw DB rows should use the post-conversion shape, matching the phase-2 boundary.

### Phase 7 — Flip ESLint rule to error

Once all violations outside the carve-out paths are resolved, change the rule from warn to error and name the carve-outs in a comment in the ESLint config.

## Checklist

- [ ] Phase 1 — Add ESLint `TSNullKeyword` warning
- [ ] Phase 2 — Add `nullToUndefined` utility + Drizzle mapped-type helper
- [ ] Phase 3 — Zod schemas: `.nullable()` → `.optional()`
- [ ] Phase 4 — Vue refs / models / computed: `T | null` → `T | undefined`
- [ ] Phase 5 — Literal assignments, returns, guards
- [ ] Phase 6 — Test fixtures
- [ ] Phase 7 — Flip ESLint rule to error; verify CI is green
