---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, targeted takeOne usage for unsafe index access patterns, destructuring from stores/composables, mock session patterns (getMockSession/mockSessionOnce/replayMockSession), the Windows UnoCSS test-skip rule, and type-level test conventions for .test-d.ts files. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Structure

- **`test` not `it`** — always `test(...)`.
- **`describe(functionRef, ...)`** — pass the function reference directly; use a string only when no importable reference exists.
- **Declare `const` inside `describe`** — all shared test constants scoped inside the `describe` callback.
- **`createCallerFactory` double-call** — always inline: `caller = createCallerFactory(router)(mockContext)`. No intermediate variable.
- **Caller naming** — single: `caller`. Multiple: descriptive (`roomCaller`, `roleCaller`).
- **Declaration order in `describe`** — `let mockContext: Context` → caller `let`s → `const` test constants.
- **`beforeAll` body order** — `mockContext` first, then callers. Never extract sub-properties (no `let db = mockContext.db`); always access via `mockContext.db`.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — put all `expect` calls after all operations/local assignments for that phase, separated by a blank line.
- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **`.toBe` for deterministic values** — when the full expected value is knowable (URL, ID, enum string), always `.toBe(fullValue)`, never `.toContain`/`.toMatch`. Inline the expected value in the `expect` call — never an intermediate `const expected*`.
- **Minimize per-test setup** — shared mutable state as `let` inside `describe`, init in `beforeEach`. Mount helpers take no arguments when state is pre-initialized.
- **Reuse utilities** — check `testUtils.test.ts` for existing helpers first.
- **`create*` prefix for test helpers** — all factory/builder functions (`createRow`, `createColumn`). Never `make*`.

## Shared Test Data (DRY)

Never repeat the same literal value or object across tests. If 2+ tests (or rows in a bulk insert) use the same thing, declare it **once** at `describe` scope and reference it. Hard rule, not preference.

- **Repeated scalars** — declare once: `const auth = ""`, `const endpoint = "http://mock-endpoint"`.
- **Repeated objects** — declare the whole object once at `describe` scope and reference it everywhere.
- **Near-identical objects** — declare a `base*` const for shared fields, then spread + override the differing field: `const baseMessage = { message, partitionKey: roomId, rowKey }; const standardMessage = { ...baseMessage, userId: senderUserId }`.
- **Repeated call arguments** — declare the constant part once and spread: `const sender = { partitionKey: roomId, userId: senderUserId }` → `getX(db, { ...sender, message })`.
- **Uniform bulk inserts** — `.map()` over the varying key instead of repeating the row literal: `[idA, idB, idC].map((userId) => ({ auth: "", endpoint: getEndpoint(userId), p256dh: "", userId }))`.
- **Repeated event/envelope wrappers** — extract a `create*` helper taking only the varying payload: `const createEvent = (data: EventGridEvent["data"]): EventGridEvent => ({ data, dataVersion: "1.0", ... })`. Call sites pass `createEvent({ ... } satisfies PayloadType)` so the payload stays type-checked.
- **Scope correctly** — values built from `beforeAll`/`beforeEach` state stay as `let`. Runtime-independent values (UUIDs, literals, static objects) go at `describe` scope as `const`. Never regenerate a UUID per test unless each test needs a unique one.
- **No single-use extraction** — only extract when used 2+ times. A value used once stays inline.

## Canonical Test Values

| Type           | Value(s)                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean        | `"true"`, `"false"` — test both in one case                                                                                                                            |
| Integer        | `"0"` / `0`                                                                                                                                                            |
| Decimal        | `"0.1"` / `0.1`                                                                                                                                                        |
| Negative       | `"-1"` / `-1`                                                                                                                                                          |
| NaN            | `String(Number.NaN)`                                                                                                                                                   |
| Date           | `"1970-01-01"`; second date: `"1970-01-02"`                                                                                                                            |
| String base    | `""` ; different value: `" "` ; use `"a"` only when space trims to `""`                                                                                                |
| Object keys    | `""` base, `" "` second — never semantic names                                                                                                                         |
| Nonexistent ID | `"-1"` (string), `-1` (number) — never `"non-existent-id"`                                                                                                             |
| Entity fields  | Use field name as literal: `const name = "name"`. UUIDs for IDs.                                                                                                       |
| UUID/ID fields | `const roomId = crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Never regenerate in `beforeEach` unless each test needs a unique ID (rare). |

- **Date format tests** — `for...of` inside a single test using `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Interpolated descriptions** — `` `${AdminActionType.BanUser}: owner bans member — ban inserted` ``. Never write enum values as string literals in titles; always template literals with the enum reference. Plain English for non-enum cases ("integer", "decimal", "epoch date").
- **Idempotency** — always `"[functionName] is idempotent"` when repeating an operation yields the same result. Never `"deduplicates ..."`, `"does not create duplicate"`, or `"skips duplicate"`.

## Array / Type Utilities

- **`takeOne(arr, index)`** — instead of `arr[index]` where `noUncheckedIndexedAccess` makes it `T | undefined`. Not universal — prefer `find` when more idiomatic.
- **`assert.exists(value)`** — narrow nullable values and fail fast instead of `?? []` coalescing.
- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), updates)` to clone + override. Never `{ ...spread }` (loses prototype).

## Destructuring

- **Stores and composables** — always destructure: `const { deleteRow, isUndoable } = operations`, `const { editedItem } = storeToRefs(store)`. Never chain `useX().method()` — destructure first.
- **No unnecessary destructure** — for plain objects (not stores/composables), access a property directly when used only once.

## Mock Session Patterns

The default mock session is always the **base user** (inserted by `createMockContext`). This user is the owner for all rooms created in tests.

- **Owner = base user, always** — never use `mockSessionOnce(db)` to create a different user just to be a room owner. Applies to `beforeEach` and helpers like `setupRoom`.
- **`getMockSession()`** — returns the base user session (stable `user.id`, new `session.id` each call). Assign before use: `const owner = getMockSession().user`.
- **Default session is owner** — API calls with no queued `mockSessionOnce` run as the base owner. Never call `mockSessionOnce(db, owner)` before owner operations; use it only to consume a queued non-owner session.
- **`mockSessionOnce(db)`** — creates a new user in the DB AND queues their session for the next API call. After that call, the default owner resumes.
- **Consume pattern** — use `getMockSession()` to consume a queued session slot without making an API call:
  ```ts
  await mockSessionOnce(mockContext.db);  // create user, queue session
  const { user } = getMockSession();       // consume slot, get user
  await roomCaller.createMembers(...);     // runs as default owner
  ```
- **`mockSessionOnce(db, existingUser)`** — requeues an existing user's session without re-inserting. Use for non-owner member operations.
- **Target: 1 `mockSessionOnce` per test** — one for non-owner user creation; all owner operations use the default.
- **`replayMockSession`** — only when the exact same session payload must be reused across multiple calls, especially when `session.id` is part of the behavior under test. If only the same user matters, prefer `mockSessionOnce(db, user)` so the test does not couple itself to session identity. If the payload comes from a newly created `mockSessionOnce(db)` user and setup should continue as the default owner, first consume the queued slot with `getMockSession()`.
- **`getMockSession().session.id` is unstable** (new UUID each call); `user.id` is stable.

## DB Cleanup and Setup

- **Clean in `afterEach`, never `beforeEach`** — `await mockContext.db.delete(table)` in `afterEach` so leaks from failed tests are visible.
- **Use callers, not `db.insert`** — set up state via tRPC callers. Only use `db.insert` when:
  - Creating a user who should NOT have a session (non-member auth failure tests)
  - Service-layer unit tests (`server/services/**`) where router callers create upward coupling
- **Never `mockContext.db.select`** — read state via callers (e.g. `caller.readRoles`).

### Symmetric setup and teardown

Every row inserted in setup must be removed in the teardown hook of the **same scope**: `beforeAll` inserts deleted in `afterAll`; per-test inserts (test body or `beforeEach`) deleted in `afterEach`. Hard rule, even though the mock DB is discarded at file end — keeps leaks visible and teardown intentional.

- **Match the scope** — `beforeAll` insert → `afterAll` delete; test body / `beforeEach` insert → `afterEach` delete.
- **Delete only root tables; let cascades handle the rest** — when a child FK is `onDelete: "cascade"`, deleting the parent removes children, so don't add explicit `delete(childTable)`. E.g. deleting `users` and `roomsInMessage` already removes `usersToRoomsInMessage` (and `scheduledMessageJobsInMessage`) rows.
- **UUID identifiers as `const` at `describe` scope, never `let` in `beforeAll`** — `crypto.randomUUID()` doesn't depend on async setup: `const userId = crypto.randomUUID()`. Only genuinely async-initialized values (e.g. `mockDb = await createMockDb()`) stay as `let` inside `beforeAll`.

## Mock Cleanup

Pick cleanup based on **how the mock was created**:

- **`vi.spyOn()` mocks → `vi.restoreAllMocks()`** (default) — reinstates the original implementation AND clears recorded calls, so spies never leak.
- **Module-level `vi.fn()` mocks (colocated `vi.mock`) → `vi.clearAllMocks()`** — `restoreAllMocks` only restores spied implementations; a standalone `vi.fn()` (e.g. `webpush.sendNotification`) was never a spy, so its call history **leaks into the next test**. Use `clearAllMocks` to reset call data while keeping the implementation. Required in any test asserting `toHaveBeenCalled*` on a module-level `vi.fn()` across multiple tests.
- **Never `vi.resetAllMocks()` as routine cleanup** — it resets implementations to empty functions, erasing intentional `vi.mock` defaults.

```ts
afterEach(async () => {
  await mockDb.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, subscriberUserId));
  // webpush.sendNotification is a module-level vi.fn() (not a spy); clearAllMocks resets call data, keeps impl.
  vi.clearAllMocks();
});
```

When a file mixes `vi.spyOn` spies AND a module-level `vi.fn()` whose count is asserted — use `vi.clearAllMocks()` (clears the `vi.fn()`) plus `vi.restoreAllMocks()` (restores the spies); neither alone covers both.

## Colocated Module Mocks (`vi.mock` import pattern)

When a service is mocked across multiple test files, create a colocated `*.test.ts` next to the service. Import via `vi.mock(import(...), () => import(...))` — **no `async` keyword** (`import()` already returns a Promise).

### Placement & export

Place mock files directly next to the service, same directory, `.test.ts` suffix:

```
src/services/getTableClient.ts          # real service
src/services/getTableClient.test.ts     # mock — imported by tests
```

**Export with the real name — never a `Mock` suffix** (e.g. `useTableClient`, not `useTableClientMock`). This lets `vi.mock(import("real"), () => import("real.test"))` work and lets tests import from the real path to get the mock. Centralize all `as unknown as` casts in the mock file. Every mock-only `.test.ts` must end with `describe.todo("serviceName")` so Vitest accepts it without a real suite:

```ts
// src/services/getTableClient.test.ts — export the real name, cast here, end with describe.todo
export const getTableClient = <T extends AzureTable>(
  tableName: T,
): Promise<CustomTableClient<AzureTableEntityMap[T]>> =>
  Promise.resolve(
    new MockTableClient<AzureTableEntityMap[T]>("", tableName) as unknown as CustomTableClient<AzureTableEntityMap[T]>,
  );

describe.todo("getTableClient");
```

### Usage in test files

```ts
vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));
```

When a test needs to call the mock directly (assert on calls / read mock state), import from the **real path** — Vitest intercepts it and returns the mock:

```ts
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
const messagesClient = await useTableClient(AzureTable.Messages);
```

- Typed `vi.mock(import(...))` enforces type compatibility — casts stay in the mock file, never in individual tests.
- If `MockXxx` from `azure-mock` doesn't satisfy the Azure SDK type (private members), fix `azure-mock` first. Use `as unknown as` in the mock `.test.ts` only when SDK private members make structural compatibility impossible.
- **Never import from the `.test` file in tests** — only from real module paths.

### `db` mock exception — getter pattern stays inline

The `db` mock cannot be centralized; it needs a getter so each test's `beforeAll`-initialized `mockDb` is lazily evaluated per-access:

```ts
// Must stay inline in each test file — not extractable to a shared mock file
let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));
```

`mockDb` must be at module level (not inside `describe`): `vi.mock` is hoisted to module scope; the getter closes over `mockDb` at the factory's lexical scope, so `let mockDb` inside `describe` would be out of scope.

### InvocationContext logHandler

Always a plain no-op: `new InvocationContext({ logHandler: () => {} })`. Never `vi.fn()` — it returns `unknown`, violating `strict-void-return`.

## Error Assertions

- **Always `.rejects.toThrowErrorMatchingInlineSnapshot(...)`** — the inline snapshot is the only accepted form; it captures the exact message for 100% accuracy. **Never `.rejects.toBeInstanceOf(...)`**, **never `.rejects.toThrow()`** without args, **never `.rejects.toThrow(arg)`**.
- **Reconstruct dynamic values into the snapshot argument** instead of falling back to `toBeInstanceOf`. When the message embeds a UUID/runtime value, interpolate that same value via the error's `.message` so the snapshot is exact every run:
  ```ts
  // tRPC-wrapped throw → [TRPCError: ...]
  await expect(webhookCaller.createWebhook(input)).rejects.toThrowErrorMatchingInlineSnapshot(
    `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Webhook, JSON.stringify(input)).message}]`,
  );
  // Direct (non-tRPC) throw → [ErrorClassName: ...]
  await expect(assertCanCreateMessage(userId, roomId, "")).rejects.toThrowErrorMatchingInlineSnapshot(
    `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
  );
  ```
- **Opaque third-party messages** (e.g. a Zod error string you can't cleanly reconstruct) — leave the snapshot empty `toThrowErrorMatchingInlineSnapshot()` and populate it with `pnpm test -u`. Still never `toBeInstanceOf`.

## Mocking Globals (navigator, window, etc.)

- **Use `vi.stubGlobal`** — never `Object.defineProperty` for globals.
- **`vi.unstubAllGlobals()` in `afterEach`** when stubs are set per-test; in `afterAll` when set once in `beforeAll`.
- **`vi.restoreAllMocks()` ≠ `vi.unstubAllGlobals()`** — `restoreAllMocks` only restores `vi.spyOn()` mocks, NOT `vi.stubGlobal()` stubs.

```ts
beforeEach(() => vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } }));
afterEach(() => vi.unstubAllGlobals());
```

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately. Use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers** — `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`. Never inside individual tests. Pin the clock with `vi.setSystemTime(0)` so `Date.now()`/`new Date()` are deterministic (epoch). `vi.useFakeTimers()` already fakes `Date`, so no `toFake` option is needed unless a test asserts on specific non-Date timer behavior.
- **Never force past/future time with large arbitrary offsets** — `new Date(Date.now() + 999_999_999)` or `slowmodeMs: 999_999_999` are banned (unstable, unreadable). With a pinned clock, use the minimal offset: `new Date(Date.now() + 1)` for "1ms in the future", `slowmodeMs: 1` + `lastMessageAt: new Date()` for "no time elapsed", and `vi.advanceTimersByTime(1)` when a test needs time to pass.

## Vitest Environment

Default environment is `node` — do **not** add `// @vitest-environment node`.

- **tRPC router tests** (`server/trpc/routers/**/*.test.ts`) — add `// @vitest-environment nuxt` as the first line.
- **Nuxt-dependent non-router tests** — add `// @vitest-environment nuxt` when Nuxt runtime APIs are required (e.g. `app/store/message/emoji.test.ts`).
- **All other tests** — no directive needed.

**DOM comes from the nuxt environment, not setup.ts.** The nuxt environment builds its own happy-dom `window`/`document` (and `mountSuspended` attaches to its own `#test-wrapper`), so there is **no** manual happy-dom registration — node-env tests run without a DOM. If a test touches the DOM (or imports something that does at module load), declare `// @vitest-environment nuxt`; do not reach for `window` in a node-env test. `fake-indexeddb/auto` stays a global setup file: it only assigns the IDB\* global constructors the `idb` library needs, is cheap in node, and the cache composables (`useCursorPaginationCache`/`useOffsetPaginationCache`) pull IndexedDB in transitively across many nuxt-env tests, so scoping it isn't worth the surface area.

## Bundle Size Snapshot Tests

Every library package (`packages/*` except `app`) has `src/index.test.ts` with a bundle size snapshot:

```ts
import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/my-package", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 12.06 KB (12345 bytes)"`);
  });
});
```

- Run `pnpm build` in the package first (the test reads compiled `dist/index.js`).
- Run `pnpm test --run -u` to update the snapshot after a build change.
- Use `getCrossPlatformSize` so CRLF/LF differences don't change snapshots across OSes.
- `app` is different — its root bundle-size suite is a `describe.todo` with `/* eslint-disable vitest/require-top-level-describe */` so CI doesn't require `packages/app/.output`.
- To add to a new library package: add `test`/`coverage` scripts, add `vitest`, `@vitest/coverage-v8`, `@types/node` to `devDependencies`, create `src/index.test.ts`.

## Running Tests

- **Do not run tests on Windows** — known Vitest crash (`TypeError: The argument 'filename' must be a file URL object...`) with UnoCSS + happy-dom. Write tests; user runs them manually.
- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.

## Testing Composables with Lifecycle Hooks

Use `mountSuspended` from `@nuxt/test-utils/runtime` with a minimal wrapper when `onMounted`/`onUnmounted` are needed:

```ts
describe(useMyComposable, () => {
  let wrapper: VueWrapper;
  const mountComposable = async () => {
    wrapper = await mountSuspended(defineComponent({ render: () => h("div"), setup: () => useMyComposable() }));
  };
  afterEach(() => wrapper?.unmount());
  // each test: await mountComposable(); then await flushPromises();
});
```

## What to Test

- **Test composables, not underlying service functions** — composable tests cover the full call chain. Only test a service directly when it has no composable wrapper.
- **Don't repeat generic middleware tests** — shared middleware (auth, membership, permissions) is tested once; skip redundant UNAUTHORIZED/NotFound tests per procedure.
- **Don't test Zod schema constraints** — min/max, regex, required-field are Zod's concern.
- **One test per operation** — combine all field assertions in a single test; don't split "updates name"/"updates bio".
- **Flat `describe` structure** — no nested `describe` for sub-grouping.

## Type-Level Tests (.test-d.ts)

- **Placement** — co-locate beside the type file.
- **`describe` string** — `"{camelCaseName} type"`.
- **`test` descriptions** — enum value or type arg directly.
- **Assertion** — always `expectTypeOf(...).toEqualTypeOf<ExpectedType>()`.
- **`expect.hasAssertions()`** — in every test body.
- **Prefer type-only fixtures** — drive `expectTypeOf` from a type expression (a type alias, or `ReturnType<typeof fn>` for a non-generic fn) rather than runtime schema values or one-line helpers (prevents unused-value/underscore/value-liveness lint churn). Note `typeof fn<TypeArg>` is invalid — you can't apply type args to a `typeof` query; alias the instantiated type instead.

## Test Utility Files

Shared helpers live in `.test.ts` files. Add `describe.todo("testUtils")` at the bottom as a placeholder suite so Vitest accepts the file without a real test.
