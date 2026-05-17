# Null Removal — Migration Plan

Goal: eliminate `null` from all TypeScript / Vue source in favour of `undefined`, enforced by an ESLint rule. The only accepted carve-outs are the Drizzle ORM / Azure boundary layers where the external systems own the type.

---

## Why

- One absent-value sentinel everywhere. `undefined` is already the implicit value for missing object keys, optional parameters, and uninitialised refs. `null` adds no meaning and forces every consumer to handle two sentinels.
- `undefined` composes cleanly with optional chaining (`?.`) and optional properties (`field?:`). `null` does not.
- Removes an entire class of `=== null` vs `=== undefined` bugs.

---

## Scope & Current State

| Area                             | Files           | Approx occurrences        | Notes                                              |
| -------------------------------- | --------------- | ------------------------- | -------------------------------------------------- |
| Vue component refs / composables | ~19             | 70 union-type annotations | `ref<T \| null>`, `defineModel<T \| null>`         |
| Literal assignments & returns    | many            | 117                       | `= null`, `return null`, `?? null`                 |
| Zod schemas                      | 3               | 15 `.nullable()`          | `ColumnStatistics`, `HandleBounds`, `TodoListItem` |
| Azure external-API types         | 5               | ~6                        | `SerializableValue`, EventGrid data shapes         |
| Drizzle nullable DB columns      | 26 schema files | N/A                       | Inferred as `T \| null` by Drizzle                 |
| Test fixtures                    | 47              | ~50                       | Mock rows with `deletedAt: null`, `image: null`    |

---

## Carve-outs (keep `null`)

These two areas are owned by external systems. Changing them would either require a DB migration or fight Azure SDK types. Keep `null` here and convert at the boundary before values enter app code.

1. **Drizzle ORM schema inferences** — nullable columns (`text()` without `.notNull()`) infer as `string | null`. Convert to `undefined` via a thin `nullToUndefined` transform in the select helpers.
2. **Azure Table / EventGrid API types** — `SerializableValue`, `FriendRequestNotificationEventGridData.icon / title`. Keep the raw Azure types as-is; convert on ingress.

---

## Migration Phases

### Phase 1 — ESLint rule (gate)

Add `@typescript-eslint/no-restricted-syntax` (or `no-null` via a shared ESLint config) to the ESLint config to error on:

- `null` as a type union member (`string | null`)
- `null` as a literal value except inside carve-out paths

Enable as a **warning** first so the existing violations are visible without blocking CI, then flip to **error** once all violations are resolved.

```ts
// packages/configuration/eslint.config.ts  (approximate)
{
  rules: {
    "@typescript-eslint/no-restricted-syntax": ["warn", {
      selector: "TSNullKeyword",
      message: "Use undefined instead of null (see features/refactors/null-removal.md).",
    }],
  },
}
```

> Carve-out paths: `packages/db-schema/src/schema/`, `packages/db-schema/src/models/azure/`, any file that directly re-exports Drizzle column inference.

---

### Phase 2 — Boundary helpers

Add two small utilities that convert nulls to undefined at the Drizzle / Azure ingress:

```ts
// packages/shared/src/util/nullToUndefined.ts
export const nullToUndefined = <T>(value: T | null): T | undefined => (value === null ? undefined : value);
```

For Drizzle select results, a mapped type helper that recursively converts `T | null` → `T | undefined` can be applied at the query layer rather than field-by-field.

These helpers are the **only** place `null` may appear in app-owned code going forward.

---

### Phase 3 — Zod schemas (15 occurrences)

Replace `.nullable()` with `.optional()` in the three files:

| File                                                        | Fields                                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `shared/models/tableEditor/file/column/ColumnStatistics.ts` | `average`, `falseCount`, `trueCount`, `min`, `max`, `topFrequencies`, etc. |
| `shared/models/flowchartEditor/data/HandleBounds.ts`        | `source`, `target`                                                         |
| `shared/models/tableEditor/todoList/TodoListItem.ts`        | `dueAt`                                                                    |

`z.number().nullable()` → `z.number().optional()`. Verify that all consumers handle `undefined` rather than `null` after.

`ColumnValue.ts` uses `z.null()` in a union — replace with `z.undefined()` or remove if the union member is never used.

`SerializableValue` in `packages/db-schema/src/models/azure/` stays as-is (carve-out).

---

### Phase 4 — Vue components & composables (70 occurrences)

Mechanical replacements:

| Pattern                                      | Replacement                                        |
| -------------------------------------------- | -------------------------------------------------- |
| `ref<Date \| null>(null)`                    | `ref<Date \| undefined>(undefined)`                |
| `ref<T \| null>(null)`                       | `ref<T \| undefined>()` (undefined is the default) |
| `defineModel<T \| null>({ required: true })` | `defineModel<T \| undefined>({ required: true })`  |
| `computed<T \| null>(...)` return type       | `computed<T \| undefined>(...)`                    |

**Vuetify date pickers** — Vuetify's `v-date-picker` and `VDateInput` accept `undefined` for no-selection; `null` is not required. Confirm against Vuetify 4 API.

Affected files (representative):

- `components/Message/RightSideBar/Search/Filter/DatePicker.vue`
- `components/Message/Model/Message/LinkPreview/Index.vue`
- `components/Styled/DatePicker.vue`

---

### Phase 5 — Literal assignments & returns (117 occurrences)

After phases 3–4 change the types, most literal `= null` and `return null` sites update automatically as TypeScript will error on the wrong type. Remaining patterns:

| Pattern                                     | Replacement                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `foo.value = null` (resetting state)        | `foo.value = undefined`                                                                        |
| `return null`                               | `return undefined`                                                                             |
| `?? null` (explicitly falling back to null) | Remove `?? null` entirely — if the left side is already `T \| undefined`, just use it directly |
| `!== null` guard                            | `!== undefined` or `?? ...` pattern                                                            |
| `=== null` guard                            | `=== undefined` or falsy check                                                                 |

---

### Phase 6 — Test fixtures (47 files)

Update mock row data: `deletedAt: null` → `deletedAt: undefined`, `image: null` → `image: undefined`, etc. These follow the same Drizzle boundary issue — test fixtures that mimic raw DB rows should use the post-conversion shape.

---

### Phase 7 — Flip ESLint rule to `error`

Once all violations outside the carve-out paths are resolved, change the rule from `warn` → `error` and add a comment in the ESLint config naming the carve-outs.

---

## Checklist

- [ ] Phase 1 — Add ESLint `TSNullKeyword` warning
- [ ] Phase 2 — Add `nullToUndefined` utility + Drizzle mapped-type helper
- [ ] Phase 3 — Zod schemas: `.nullable()` → `.optional()`
- [ ] Phase 4 — Vue refs / models / computed: `T | null` → `T | undefined`
- [ ] Phase 5 — Literal assignments, returns, guards
- [ ] Phase 6 — Test fixtures
- [ ] Phase 7 — Flip ESLint rule to error; verify CI is green
