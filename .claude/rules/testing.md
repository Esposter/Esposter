---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Testing Conventions (Vitest)

- **`describe(functionRef, ...)`** — pass the function reference directly, not a string name. Only use a string when there is no importable function reference (e.g. methods on a composable's return object).
- **Declare `const` inside `describe`** — all shared test constants (e.g. `HEADER`, reusable values) must be declared inside the `describe` callback scope, not at module level, so they are scoped and cleaned up correctly.
- **`expect.hasAssertions()`** — always include at the top of every test body.
- **Canonical test values** — always use minimal, meaningful values:
  - Boolean: `"true"`, `"false"` — test both together in one test
  - Integer: `"0"` / number `0`
  - Decimal: `"0.1"` / number `0.1`
  - Negative: `"-1"` / number `-1`
  - NaN: `String(Number.NaN)`
  - Date (epoch): `"1970-01-01"` (YYYY-MM-DD); second date: `"1970-01-02"`
  - String: `""` as base value; use `" "` for a different value. Only use `"a"` when a space would be trimmed to `""` (making it identical to base). Never use named strings like `"Alice"` / `"Bob"`.
  - Object keys in tests: use `""` as base key, `" "` as a second key — never use semantic names like `"name"` / `"age"`.
  - Number diff values: `0`, `1`, `2`, etc.
- **Date format tests** — when testing all date formats, use a `for...of` loop inside a single test, converting epoch via `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never use `test.each` for date format iteration.
- **Interpolated descriptions** — use template literals with enum values: `` `boolean returns ${ColumnType.Boolean}` ``.
- **Human-readable names** — use plain English: "integer", "decimal", "negative", "epoch date", "NaN".
- **Array index access** — always use `takeOne(arr, index)` from `@esposter/shared` instead of `arr[index]` or `arr[index]?.` — `noUncheckedIndexedAccess` makes direct index access return `T | undefined`, and `takeOne` throws on out-of-bounds while keeping the type non-nullable.
- **Destructure from stores and composables** — always destructure return values: `const { deleteRow, undo, isUndoable } = operations` rather than calling `operations.deleteRow(...)`. Same for stores: `const { editedItem } = storeToRefs(store)` and `const { methodName } = store`. This applies inside `beforeEach` too — never chain `useX().method()` inline; always `const { method } = useX()` first.
- **Cloning in tests** — use `structuredClone(obj)` for deep clones; use `Object.assign(structuredClone(obj), { ...updates })` to clone and override fields. Never use `{ ...spread }` syntax to clone — it creates a plain object losing the prototype. Pass `new Foo({ ... })` directly when a fresh instance already suffices (no need to clone or spread it).
- **Assertions after all assignments** — put all `expect` and `expectToBeDefined` calls after all operation calls and local assignments for that phase, separated by a blank line. For multi-phase tests (e.g. undo then redo), each phase is its own block: operations + `const local = reactive.value?.x`, blank line, then assertions on `local`. Never interleave expects with assignments.

## Running Tests

- **Do not run tests on Windows** — Vitest currently fails on Windows with `TypeError: The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received 'file:///__uno.css'`. This is a known environment issue with UnoCSS + happy-dom. Write tests but skip running them; the user runs them manually.
