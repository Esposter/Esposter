---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, targeted takeOne usage for unsafe index access patterns, destructuring from stores/composables, mock session patterns (getMockSession/mockSessionOnce/replayMockSession), the Windows UnoCSS test-skip rule, and type-level test conventions for .test-d.ts files. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Structure

- **`describe(functionRef, ...)`** — pass the function reference directly; use a string only when no importable reference exists.
- **Declare `const` inside `describe`** — all shared test constants must be scoped inside the `describe` callback.
- **`createCallerFactory` double-call** — always inline: `caller = createCallerFactory(router)(mockContext)`. No intermediate variable.
- **Caller naming** — single caller: `caller`. Multiple: descriptive names (`roomCaller`, `roleCaller`).
- **Declaration order inside `describe`** — `let mockContext: Context` → caller `let`s → `const` test constants.
- **`beforeAll` body order** — `mockContext` first, then callers. Never extract sub-properties (no `let db = mockContext.db`); always access via `mockContext.db` etc.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — put all `expect` calls after all operations and local assignments for that phase, separated by a blank line.
- **`toStrictEqual` always** — never `toEqual`, never `toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **Minimize per-test setup** — shared mutable state as `let` inside `describe`, init in `beforeEach`. Mount helpers take no arguments when state is pre-initialized.
- **Reuse utilities** — check `testUtils.test.ts` for existing helpers before writing local equivalents.
- **`create*` prefix for test helpers** — all test factory/builder functions use the `create*` prefix (`createRow`, `createColumn`, `createMention`). Never `make*` (`makeRow`, `makeColumn`).

## Canonical Test Values

| Type           | Value(s)                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean        | `"true"`, `"false"` — test both in one case                                                                                                                                         |
| Integer        | `"0"` / `0`                                                                                                                                                                         |
| Decimal        | `"0.1"` / `0.1`                                                                                                                                                                     |
| Negative       | `"-1"` / `-1`                                                                                                                                                                       |
| NaN            | `String(Number.NaN)`                                                                                                                                                                |
| Date           | `"1970-01-01"`; second date: `"1970-01-02"`                                                                                                                                         |
| String base    | `""` ; different value: `" "` ; use `"a"` only when space trims to `""`                                                                                                             |
| Object keys    | `""` base, `" "` second — never semantic names                                                                                                                                      |
| Nonexistent ID | `"-1"` (string), `-1` (number) — never `"non-existent-id"` etc.                                                                                                                     |
| Entity fields  | Use field name as literal: `const name = "name"`. UUIDs for IDs.                                                                                                                    |
| UUID/ID fields | `const roomId = crypto.randomUUID()` at **describe scope** — never `"room-1"` or `"test-id"`. Never regenerate in `beforeEach` unless each test genuinely needs a unique ID (rare). |

- **Date format tests** — `for...of` inside a single test using `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Interpolated descriptions** — `` `${AdminActionType.BanUser}: owner bans member — ban inserted` ``. **Never write enum values as string literals** in describe/test titles; always use template literals with the enum reference. Plain English names for non-enum cases: "integer", "decimal", "epoch date".

## Array / Type Utilities

- **`takeOne(arr, index)`** — use instead of `arr[index]` where `noUncheckedIndexedAccess` makes it `T | undefined`. Do not use universally — prefer `find` when more idiomatic.
- **`assert.exists(value)`** — use to narrow nullable values and fail fast instead of `?? []` coalescing.
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), updates)` to clone + override. Never `{ ...spread }` (loses prototype).

## Destructuring

- **Stores and composables** — always destructure: `const { deleteRow, isUndoable } = operations`, `const { editedItem } = storeToRefs(store)`. Never chain `useX().method()` — destructure first.
- **No unnecessary destructure** — for plain objects (not stores/composables), access a property directly when used only once instead of destructuring it into a variable.

## Mock Session Patterns

The default mock session is always the **base user** (inserted by `createMockContext`). This user is the owner for all rooms created in tests.

- **Owner = base user, always** — the room owner is always the base user from `getMockSession()`. Never use `mockSessionOnce(db)` to create a different user just to be a room owner. This applies to `beforeEach` and helper functions like `setupRoom`.
- **`getMockSession()`** — returns the base user session (stable `user.id`, new `session.id` each call). Assign before use: `const owner = getMockSession().user` or `const { user } = getMockSession()`.
- **Default session is owner** — API calls with no queued `mockSessionOnce` run as the base owner. Never call `mockSessionOnce(db, owner)` before owner operations; use it only when a prior `mockSessionOnce(db)` queued a non-owner session that hasn't been consumed.
- **`mockSessionOnce(db)`** — creates a new user in the DB AND queues their session for the next API call. After that call consumes the slot, the default (owner) resumes.
- **Consume pattern** — use `getMockSession()` to consume a queued session slot without making an API call:
  ```ts
  await mockSessionOnce(mockContext.db);  // create user, queue session
  const { user } = getMockSession();       // consume slot, get user
  await roomCaller.createMembers(...);     // runs as default owner
  ```
- **`mockSessionOnce(db, existingUser)`** — requeues an existing user's session without re-inserting. Use for non-owner member operations.
- **Target: 1 `mockSessionOnce` per test** — one for non-owner user creation. All owner operations use the default.
- **`replayMockSession`** — only when the same session payload must be reused across multiple calls.
- **`getMockSession().session.id` is unstable** — creates a new UUID each call. `user.id` is stable.

## DB Cleanup and Setup

- **Clean in `afterEach`, never `beforeEach`** — `await mockContext.db.delete(table)` in `afterEach` so leaks from failed tests are visible.
- **Use callers, not `db.insert`** — set up state via tRPC callers; direct DB inserts bypass app logic. Only use `db.insert` when:
  - Creating a user who should NOT have a session (non-member auth failure tests)
  - Service-layer unit tests (`server/services/**`) where using router callers creates upward coupling
- **Never `mockContext.db.select`** — read state via callers (e.g. `caller.readRoles`), not raw DB queries.

## Mock Cleanup

- **Use `vi.restoreAllMocks()` in cleanup** — prefer `restoreAllMocks` over `clearAllMocks`. `restoreAllMocks` restores spied/mocked implementations and clears mock state; `clearAllMocks` only clears usage data and can leak mock implementations between tests.
- **Do not use `vi.resetAllMocks()` as routine cleanup** — it resets mock implementations to empty functions, which can erase intentional `vi.mock` defaults and make tests less explicit.

## Error Assertions

- **Never `.rejects.toThrow()`** — always assert the specific error: `.rejects.toThrowErrorMatchingInlineSnapshot(...)` or `.rejects.toBeInstanceOf(ErrorClass)`.

## Mocking Globals (navigator, window, etc.)

- **Use `vi.stubGlobal`** — never `Object.defineProperty` for globals; `stubGlobal` integrates with Vitest's stub tracking.
- **`vi.unstubAllGlobals()` in `afterEach`** — when stubs are set per-test in `beforeEach`. When set once in `beforeAll`, clean up in `afterAll`.
- **`vi.restoreAllMocks()` ≠ `vi.unstubAllGlobals()`** — `restoreAllMocks` only restores `vi.spyOn()` mocks; it does NOT clean up `vi.stubGlobal()` stubs.

```ts
beforeEach(() => {
  writeTextMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately. Use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers** — `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`. Never inside individual tests.

## Vitest Environment

- **tRPC router tests** (`server/trpc/routers/**/*.test.ts`) — no `// @vitest-environment` directive (Nuxt env required).
- **All other server-side tests** — add `// @vitest-environment node` as first line.

## Running Tests

- **Do not run tests on Windows** — known Vitest crash: `TypeError: The argument 'filename' must be a file URL object...` with UnoCSS + happy-dom. Write tests; user runs them manually.
- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.

## Testing Composables with Lifecycle Hooks

Use `mountSuspended` from `@nuxt/test-utils/runtime` with a minimal wrapper when `onMounted`/`onUnmounted` are needed:

```ts
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
  });
});
```

## What to Test

- **Test composables, not underlying service functions** — composable tests cover the full call chain. Only test a service function directly when it has no composable wrapper.
- **Don't repeat generic middleware tests** — shared middleware (auth, membership, permissions) is tested once. Skip redundant UNAUTHORIZED/NotFound tests per procedure.
- **Don't test Zod schema constraints** — min/max, regex, required-field are Zod's concern.
- **One test per operation** — combine all field assertions in a single test case; don't split "updates name", "updates bio" into separate tests.
- **Flat `describe` structure** — no nested `describe` for sub-grouping.

## Type-Level Tests (.test-d.ts)

- **Placement** — co-locate beside the type file.
- **`describe` string** — `"{camelCaseName} type"`.
- **`test` descriptions** — enum value or type arg directly.
- **Assertion** — always `expectTypeOf(...).toEqualTypeOf<ExpectedType>()`.
- **`expect.hasAssertions()`** — in every test body.

## Test Utility Files

Shared helpers must live in `.test.ts` files. Add `describe.todo("testUtils")` at the bottom as a placeholder suite so Vitest accepts the file without requiring a real test.
