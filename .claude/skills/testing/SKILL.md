---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, targeted takeOne usage for unsafe index access patterns, destructuring from stores/composables, mock session patterns (getMockSession/mockSessionOnce/replayMockSession), and the Windows UnoCSS test-skip rule. Apply when writing .test.ts files.
---

# Testing Conventions (Vitest)

- **`describe(functionRef, ...)`** — pass the function reference directly, not a string name. Only use a string when there is no importable function reference (e.g. methods on a composable's return object).
- **Declare `const` inside `describe`** — all shared test constants (e.g. `HEADER`, reusable values) must be declared inside the `describe` callback scope, not at module level, so they are scoped and cleaned up correctly.
- **`createCallerFactory` double-call** — always use the double-call form inline: `caller = createCallerFactory(router)(mockContext)`. Do not define an intermediate `const createCaller = createCallerFactory(router)` — the factory variable itself is unnecessary.
- **`describe` declaration order** — inside `describe`, declare in this order: `let mockContext: Context` first, then caller `let`s, then `const` test value constants. Example: `let mockContext: Context`, `let caller`, `let roomCaller`, `const name = "name"`. Always type `mockContext` as `Context` (imported from `@@/server/trpc/context`), never as `Awaited<ReturnType<typeof createMockContext>>`.
- **`beforeAll` body order** — assign `mockContext` first (`mockContext = await createMockContext()`), then assign each caller using the double-call form. Never extract sub-properties of `mockContext` into separate `let` variables (e.g. no `let mockDb: Context["db"]`). Always access them via `mockContext.db`, `mockContext.session`, etc. at the point of use.
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
  - Non-existent / sentinel values: use `"-1"` for a nonexistent string ID, `-1` for a nonexistent numeric ID. Never use verbose strings like `"non-existent-id"`, `"nonexistent"`, `"some-id"`, `"fake-..."`, etc.
  - Entity fields: use the field name as the literal value — `const partitionKey = "partitionKey"`, `const rowKey = "rowKey"`, `const message = "message"`. Use `crypto.randomUUID()` for ID fields (`userId`, `partitionKey` when used as a room/entity ID, route params) to match real-world UUID-based IDs. Never inline constructor args — always declare shared constants and reference them.
- **Date format tests** — when testing all date formats, use a `for...of` loop inside a single test, converting epoch via `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never use `test.each` for date format iteration.
- **Interpolated descriptions** — use template literals with enum values: `` `boolean returns ${ColumnType.Boolean}` ``.
- **Human-readable names** — use plain English: "integer", "decimal", "negative", "epoch date", "NaN".
- **Array index access** — use `takeOne(arr, index)` from `@esposter/shared` where it resolves real `noUncheckedIndexedAccess` type friction (i.e. where direct index access returns `T | undefined` and you need a non-nullable type). `takeOne` throws on out-of-bounds while keeping the type non-nullable. Do not use it universally — prefer `find`/`findIndex` + guard when that is more idiomatic for the pattern.
- **`assert.exists` instead of `?? []` coalescing** — when you know a value should exist (e.g. `editedItem.value?.dataSource`), use `assert.exists(editedItem.value?.dataSource)` to narrow the type and fail fast, then access the value directly. Never use `?? []` (or similar falsy coalescing) to silence a type error in tests — it hides the failure and passes an empty collection to `takeOne`, producing a misleading error. Pattern: `assert.exists(editedItem.value?.dataSource); deleteRow(takeOne(editedItem.value.dataSource.rows).id);`
- **Destructure from stores and composables** — always destructure return values: `const { deleteRow, undo, isUndoable } = operations` rather than calling `operations.deleteRow(...)`. Same for stores: `const { editedItem } = storeToRefs(store)` and `const { methodName } = store`. This applies inside `beforeEach` too — never chain `useX().method()` inline; always `const { method } = useX()` first.
- **Always assign `getMockSession()` results** — never inline `getMockSession().user.id` or `getMockSession().session.id` directly in an expression. Always assign first. Use direct property access when only one property is needed (`const userId = getMockSession().user.id`), and destructure only when multiple properties are needed (`const { user } = getMockSession()` to use both `user.id` and `user.name`). This applies even when used only once.
- **`getMockSession()` session ID is unstable** — `getMockSession().session.id` creates a **new random UUID on every call** (via `createSession`). It cannot be used to assert against what a tRPC procedure used internally, since the procedure's `auth.api.getSession()` call generates its own fresh UUID. `getMockSession().user.id` is stable (created once in `vi.hoisted`). Use the following patterns depending on what you need:
  - **user identity only** — `const { user } = getMockSession()` then use `user.id` / `user.name` etc.
  - **session ID tied to a procedure** — use `mockSessionOnce` to queue a known session before the call, then destructure what you need: `const { session, user } = await mockSessionOnce(mockContext.db, getMockSession().user)`. Destructure only what the test uses — `{ session }` if only the session ID is needed, `{ session, user }` if both are needed.
  - **same session across chained calls** — capture once then replay: `const sessionPayload = await mockSessionOnce(...); await caller.join(...); replayMockSession(sessionPayload); await caller.setMute(...)`. This ensures all operations use the same session ID (required when a later call looks up a participant stored by the earlier call's session ID).
- **Cloning in tests** — use `structuredClone(obj)` for deep clones; use `Object.assign(structuredClone(obj), { ...updates })` to clone and override fields. Never use `{ ...spread }` syntax to clone — it creates a plain object losing the prototype. Pass `new Foo({ ... })` directly when a fresh instance already suffices (no need to clone or spread it).
- **Assertions after all assignments** — put all `expect` and `expectToBeDefined` calls after all operation calls and local assignments for that phase, separated by a blank line. For multi-phase tests (e.g. undo then redo), each phase is its own block: operations + `const local = reactive.value?.x`, blank line, then assertions on `local`. Never interleave expects with assignments.
- **Always use `toStrictEqual`** — never use `toEqual`.
- **Always assert exact counts** — never use `.toBeGreaterThan(0)` or `.toBeTruthy()` on collections. Tests must be deterministic: if you expect 1 result, write `expect(results).toHaveLength(1)`. If you don't know the exact count, the test is incomplete. `toStrictEqual` checks object types and class instances correctly; `toEqual` silently ignores prototype differences.
- **Minimize per-test setup** — declare shared mutable state (`source`, `callback`, `cleanup`, etc.) as `let` variables inside `describe`, initialize them in `beforeEach`. Mount helpers should take no arguments when all state is pre-initialized. Only reassign in the test body when a test needs a different variant (e.g. `callback = vi.fn(() => cleanup)` for cleanup tests).
- **Reuse test utilities** — always check `testUtils.test.ts` for existing helpers (e.g. `makeDataSource`, `makeRow`, `makeColumn`, `makeNumberColumn`, `setupWithDataSource`) before writing local equivalents.

## Error Assertions

- **Never use `.rejects.toThrow()`** — bare `.toThrow()` passes for any error. Always assert the specific error with `.rejects.toThrowErrorMatchingInlineSnapshot(...)` or `.rejects.toBeInstanceOf(ErrorClass)`. See the **trpc** skill for tRPC-specific error assertion patterns.

## Waiting for Reactive Effects in Tests

There is no DOM in this test environment, so `nextTick` is never needed — synchronous reactive effects (computed re-evaluation, synchronous watch callbacks) take place immediately when a ref changes.

For **watchers that handle critical state synchronization or cleanup**, always use `{ flush: "sync" }` in the `watch` options. This ensures that the callback's synchronous side-effects (like clearing an array) happen immediately upon the ref change, allowing for cleaner tests without `nextTick` or `flushPromises`.

For **async watch callbacks** (`watch(ref, async () => { ... })`) that are NOT flushed synchronously, Vue fires the callback but does not await it. Use `flushPromises()` from `@vue/test-utils` to drain the entire microtask queue so the watch body fully completes before asserting:

```ts
import { flushPromises } from "@vue/test-utils";

editFormDialog.value = false;
await flushPromises();
expect(isUndoable.value).toBe(false);
```

Never use `await nextTick()` in tests — it is either unnecessary (sync effects) or insufficient (async watch bodies). For synchronous side-effects of `{ flush: "sync" }` watchers, no waiting is required. For any other pending async work, always use `flushPromises`.

## Running Validation Commands

- **Always run `pnpm lint`, `pnpm typecheck`, and test commands in the background** — use `run_in_background: true` on the Bash tool so the main conversation is not blocked. These commands can take over 2 minutes. Continue addressing other tasks while waiting for results.

## Vitest Environment Selection

- **tRPC router tests (`server/trpc/routers/**/\*.test.ts`)** — do NOT add `// @vitest-environment node`. These tests run in the Nuxt environment (required for `createCallerFactory`, `createMockContext`, and Nuxt module integration). Adding the directive breaks the setup.
- **All other server-side tests** — add `// @vitest-environment node` as the first line. This includes `server/services/**`, `server/composables/**`, and any standalone utility tests.

## Running Tests

- **Do not run tests on Windows** — Vitest currently fails on Windows with `TypeError: The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received 'file:///__uno.css'`. This is a known environment issue with UnoCSS + happy-dom. Write tests but skip running them; the user runs them manually.

## Testing Composables with Lifecycle Hooks

Composables that use `onMounted`/`onUnmounted` require a component lifecycle to trigger. Use `mountSuspended` from `@nuxt/test-utils/runtime` with a minimal wrapper:

```ts
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

describe(useMyComposable, () => {
  let wrapper: VueWrapper;
  const mountComposable = async () => {
    wrapper = await mountSuspended(defineComponent({ render: () => h("div"), setup: () => useMyComposable() }));
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  test("example", async () => {
    expect.hasAssertions();
    await mountComposable();
    await flushPromises();
    // assertions...
  });
});
```

- Always unmount in `afterEach` to trigger `onUnmounted` cleanup
- When re-mounting mid-test (e.g. to simulate offline restart), call `wrapper.unmount()` before `await mountComposable()`

## What to Test

- **Test composables, not the underlying service functions** — composable tests integration-test the full call chain (store wiring, command dispatch, history push) in one place. If the composable is tested, the service functions it calls are covered implicitly; there is no need to write separate unit tests for those functions. Only test a service function directly when it has no composable wrapper (e.g. standalone pure utilities like `coerceValue`, `inferColumnType`).

## Test Utility Files

Shared test helpers (factory functions, setup helpers, etc.) must live in `.test.ts` files, never plain `.ts` files. To prevent Vitest from treating the file as a test suite, add `describe.todo("testUtils")` at the very bottom of the file.
