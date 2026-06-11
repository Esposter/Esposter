---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, targeted takeOne usage for unsafe index access patterns, destructuring from stores/composables, mock session patterns (getMockSession/mockSessionOnce/replayMockSession), the Windows UnoCSS test-skip rule, and type-level test conventions for .test-d.ts files. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Structure

- **`test` not `it`** — always use `test(...)`. Never use `it(...)`.
- **`describe(functionRef, ...)`** — pass the function reference directly; use a string only when no importable reference exists.
- **Declare `const` inside `describe`** — all shared test constants must be scoped inside the `describe` callback.
- **`createCallerFactory` double-call** — always inline: `caller = createCallerFactory(router)(mockContext)`. No intermediate variable.
- **Caller naming** — single caller: `caller`. Multiple: descriptive names (`roomCaller`, `roleCaller`).
- **Declaration order inside `describe`** — `let mockContext: Context` → caller `let`s → `const` test constants.
- **`beforeAll` body order** — `mockContext` first, then callers. Never extract sub-properties (no `let db = mockContext.db`); always access via `mockContext.db` etc.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — put all `expect` calls after all operations and local assignments for that phase, separated by a blank line.
- **`toStrictEqual` always** — never `toEqual`, never `toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **`.toBe` for deterministic values** — when the full expected value is knowable (URL, ID, enum string), always `.toBe(fullValue)`. Never `.toContain` or `.toMatch` when the complete value can be constructed. Inline the expected value directly in the `expect` call — never assign it to an intermediate `const expected*` variable.
- **Minimize per-test setup** — shared mutable state as `let` inside `describe`, init in `beforeEach`. Mount helpers take no arguments when state is pre-initialized.
- **Reuse utilities** — check `testUtils.test.ts` for existing helpers before writing local equivalents.
- **`create*` prefix for test helpers** — all test factory/builder functions use the `create*` prefix (`createRow`, `createColumn`, `createMention`). Never `make*` (`makeRow`, `makeColumn`).

## Shared Test Data (DRY)

Never repeat the same literal value or object across tests. If two or more tests (or rows in a bulk insert) use the same thing, declare it **once** at `describe` scope and reference it. This is a hard rule, not a preference.

- **Repeated scalar values** — declare once: `const auth = ""`, `const p256dh = ""`, `const endpoint = "http://mock-endpoint"`. Never inline the same literal in multiple places.
- **Repeated objects** — declare the whole object once at `describe` scope: `const pushSubscription = { auth: "", endpoint, p256dh: "", userId: subscriberUserId }`, `const notificationOptions = { icon: "", title: "" }`. Reference the const in every test that needs it.
- **Near-identical objects** — declare a `base*` const for the shared fields, then spread + override the one field that differs: `const baseMessage = { message, partitionKey: roomId, rowKey }; const standardMessage = { ...baseMessage, userId: senderUserId }`. The webhook variant just reuses `baseMessage`. Never copy-paste a 4-field object to change one field.
- **Repeated call arguments** — when the same argument shape recurs across calls with one varying field, declare the constant part once and spread: `const sender = { partitionKey: roomId, userId: senderUserId }` → `getX(db, { ...sender, message })`.
- **Uniform bulk inserts** — when DB insert rows differ only by a single key, `.map()` over that key instead of repeating the row literal: `[idA, idB, idC].map((userId) => ({ auth: "", endpoint: getEndpoint(userId), p256dh: "", userId }))`. Never hand-write N rows that share the same `auth`/`p256dh`/etc.
- **Repeated event/envelope wrappers** — extract a `create*` helper that takes only the varying payload: `const createEvent = (data: EventGridEvent["data"]): EventGridEvent => ({ data, dataVersion: "1.0", ... })`. Call sites pass `createEvent({ ... } satisfies PayloadType)` so the payload is still type-checked.
- **Scope correctly** — values built from `beforeAll`/`beforeEach` state stay as `let` (assigned there). Values that don't depend on runtime setup (UUIDs, literals, static objects) go at `describe` scope as `const`. Never regenerate a UUID per test unless each test genuinely needs a unique one.
- **No single-use extraction** — only extract when a value is used 2+ times (or 2+ identical rows). A value used exactly once stays inline (see "No unnecessary destructure").

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
- **Idempotency** — always `"[functionName] is idempotent"` when calling the same operation multiple times produces the same result (e.g. `"createSpeaker is idempotent"`, `"creates is idempotent"`). Never use `"deduplicates [thing]"`, `"does not create duplicate"`, or `"skips duplicate"`.

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

### Symmetric setup and teardown

Every row inserted in setup must be removed in the teardown hook of the **same scope**: `beforeAll` inserts are deleted in `afterAll`; rows inserted per test (in the test body or `beforeEach`) are deleted in `afterEach`. Never leave `beforeAll` inserts uncleaned just because the in-memory mock database is discarded at the end of the file — the symmetry is a hard rule so that leaks are always visible and teardown stays intentional.

- **Match the scope** — if you inserted in `beforeAll`, add an `afterAll` that deletes the same rows. If you inserted in a test body or `beforeEach`, delete in `afterEach`.
- **Delete only the root tables and let cascades handle the rest** — when a child table's foreign key is `onDelete: "cascade"`, deleting the parent removes the children automatically, so do not add an explicit `delete(childTable)` for a cascaded child. For example, deleting `users` and `roomsInMessage` already removes the `usersToRoomsInMessage` join rows (and any `scheduledMessageJobsInMessage` rows), so the teardown lists only `users` and `roomsInMessage`.
- **Declare UUID identifiers as `const` at `describe` scope, never `let` assigned in `beforeAll`** — a `crypto.randomUUID()` value does not depend on any asynchronous setup, so it belongs at `describe` scope: `const userId = crypto.randomUUID()`. Only values that genuinely require asynchronous initialisation (such as `mockDb = await createMockDb()`) stay as a `let` assigned inside `beforeAll`.

## Mock Cleanup

- **Use `vi.restoreAllMocks()` in cleanup** — prefer `restoreAllMocks` over `clearAllMocks`. `restoreAllMocks` restores spied/mocked implementations and clears mock state; `clearAllMocks` only clears usage data and can leak mock implementations between tests.
- **Do not use `vi.resetAllMocks()` as routine cleanup** — it resets mock implementations to empty functions, which can erase intentional `vi.mock` defaults and make tests less explicit.

## Colocated Module Mocks (`vi.mock` import pattern)

When a service needs to be mocked across multiple test files, create a colocated `*.test.ts` file next to the service. Import it via `vi.mock(import(...), () => import(...))` — **no `async` keyword** (`import()` already returns a Promise).

### Colocated mock file placement

Place mock files directly next to the service they mock — same directory, `.test.ts` suffix:

```
src/services/getTableClient.ts          # real service
src/services/getTableClient.test.ts     # mock — imported by tests
```

**Export with the real name — never a `Mock` suffix.** The mock file must export the same names as the real module (e.g. `useTableClient`, not `useTableClientMock`). This lets `vi.mock(import("real"), () => import("real.test"))` work automatically and lets tests import from the real path to get the mock.

Centralize all `as unknown as` casts in the mock file, not in individual test files. Every mock-only `.test.ts` file **must** end with `describe.todo("serviceName")` so Vitest accepts it without a real test suite:

```ts
// src/services/getTableClient.test.ts
import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";
import { MockTableClient } from "azure-mock";
import { describe } from "vitest";

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
vi.mock(import("@/services/getWebPubSubServiceClient"), () => import("@/services/getWebPubSubServiceClient.test"));
```

When a test needs to call the mock directly (e.g. to assert on calls or read mock state), import from the **real path** — Vitest intercepts it and returns the mock:

```ts
// moderation.test.ts — import from REAL path, not from .test file
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";

// Vitest serves the mock because context.test.ts (imported by this file) has vi.mock registered
const messagesClient = await useTableClient(AzureTable.Messages);
```

- Typed `vi.mock(import(...))` form enforces type compatibility — casts stay in the mock file, never in individual tests.
- If `MockXxx` from `azure-mock` doesn't satisfy the Azure SDK type (private class members), fix `azure-mock` first. Use `as unknown as` in the mock `.test.ts` only when the SDK class has private members that make structural compatibility impossible.
- **Never import from the `.test` file in tests** — only import from real module paths. The mock is wired via `vi.mock`.

### `db` mock exception — getter pattern stays inline

The `db` mock cannot be centralized. It needs a getter so each test's `beforeAll`-initialized `mockDb` is lazily evaluated per-access:

```ts
// Must stay inline in each test file — not extractable to a shared mock file
let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));
```

**Why `mockDb` must be at module level** (not inside `describe`): `vi.mock` is hoisted to module scope by Vitest. The getter closes over `mockDb` at the factory's lexical scope. Declaring `let mockDb` inside `describe` puts it out of the getter's scope — it must remain at module level.

### InvocationContext logHandler

Always use a plain no-op: `new InvocationContext({ logHandler: () => {} })`. Never use `vi.fn()` — it returns `unknown`, which violates `strict-void-return` for the `logHandler` type.

## Error Assertions

- **Prefer `.rejects.toThrowErrorMatchingInlineSnapshot(...)`** — use when the error message is deterministic (no dynamic UUIDs, timestamps, or runtime values).
- **Use `.rejects.toBeInstanceOf(ErrorClass)`** — when the error message contains dynamic values (e.g. a UUID from `crypto.randomUUID()`) that prevent a stable inline snapshot.
- **Never `.rejects.toThrow()` without args** — always assert the specific error type or message.
- **Never `.rejects.toThrow(ErrorClass)`** — use `toThrowErrorMatchingInlineSnapshot` or `toBeInstanceOf`, not the overloaded `toThrow(class)` form.

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

The default Vitest environment is `node` — do **not** add `// @vitest-environment node` to any test file.

- **tRPC router tests** (`server/trpc/routers/**/*.test.ts`) — add `// @vitest-environment nuxt` as the first line (Nuxt env required).
- **All other tests** — no directive needed when Node runtime is sufficient.
- **Nuxt-dependent non-router tests** — add `// @vitest-environment nuxt` as the first line when Nuxt runtime APIs are required (e.g. `packages/app/app/store/message/emoji.test.ts`).

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

- Run `pnpm build` in the package first — the test reads the compiled `dist/index.js`.
- Run `pnpm test --run -u` to update the snapshot value after a build change.
- Use `getCrossPlatformSize` so CRLF/LF differences do not change snapshots across Windows and Linux/macOS.
- `app` is different — its root bundle-size suite is currently a `describe.todo` with `/* eslint-disable vitest/require-top-level-describe */` so CI coverage does not require `packages/app/.output`.

To add a bundle size test to a new library package: add `test`/`coverage` scripts, add `vitest`, `@vitest/coverage-v8`, `@types/node` to `devDependencies`, create `src/index.test.ts`.

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
- **Prefer type-only fixtures** — when testing generic function signatures, instantiate the function type directly with `ReturnType<typeof fn<TypeArg>>()` or equivalent type expressions. Avoid creating runtime schema values or one-line helper functions just to feed `expectTypeOf`; this prevents unused-value, underscore, and value-liveness lint churn.

## Test Utility Files

Shared helpers must live in `.test.ts` files. Add `describe.todo("testUtils")` at the bottom as a placeholder suite so Vitest accepts the file without requiring a real test.
