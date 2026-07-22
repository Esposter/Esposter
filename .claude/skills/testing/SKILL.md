---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, takeOne for unsafe index access, no unnecessary destructure of plain objects, mock session patterns (getMockSession/mockSessionOnce/replayMockSession), mock cleanup by creation style, toThrowErrorMatchingInlineSnapshot as the only error assertion, the node-default test environment (nuxt only via per-file directive; stub window for client/server paths), bundle-size snapshot tests, and type-level conventions for .test-d.ts files. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Structure

- **`test` not `it`** — always `test(...)`.
- **`describe(functionRef, ...)`** — pass the function reference directly; use a string only when no importable reference exists.
- **Declare `const` inside `describe`** — all shared test constants scoped inside the `describe` callback.
- **`describe.skipIf`/`test.skipIf` for capability/platform gating** — gate on the same capability probe the production code uses (e.g. `describe.skipIf(!isSupported())`), not a narrower proxy (e.g. `process.platform !== "linux"`); a host can pass the platform check yet still lack the underlying dependency, so the narrower gate lets an unsupported host through.
- **Never construct a throw-on-unsupported resource in describe scope** — `describe.skipIf(...)` still executes its body at **collection time** even when the suite is skipped, so `const x = createThrowingThing()` at describe scope throws on unsupported hosts before the skip applies. Construct it **inside each test/bench callback** instead; only factories that never throw may stay at describe scope and be reused across tests.
- **`createCallerFactory` double-call** — always inline: `caller = createCallerFactory(router)(mockContext)`. No intermediate variable.
- **Caller naming** — single: `caller`. Multiple: descriptive (`roomCaller`, `roleCaller`).
- **Declaration order in `describe`** — `let mockContext: Context` → caller `let`s → `const` test constants.
- **`beforeAll` body order** — `mockContext` first, then callers. Never extract sub-properties (no `let db = mockContext.db`); always access via `mockContext.db`.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — put all `expect` calls after all operations/local assignments for that phase, separated by a blank line.
- **`Promise<void>` calls** — never assign into a `const` (`const result = await fn()` trips `no-confusing-void-expression`). Two cases:
  - **Another assertion already follows** in the same test (e.g. a mock `not.toHaveBeenCalled`, or a follow-up read) → just `await fn();` as a bare statement. The trailing assertion satisfies `hasAssertions()`; a `.resolves.toBeUndefined()` there is pure ceremony.
  - **Success is the only thing checked** → `await expect(fn()).resolves.toBeUndefined();` — the minimal positive assertion, the mirror of the `.rejects.` negative case, and it satisfies `hasAssertions()` (a bare `await` alone would run zero assertions and fail it).
  - When the promise resolves to a **real value**, `await` into a `const` and assert on it: `const count = await caller.count(); expect(count).toBe(x);`. `.rejects.` stays the only accepted async **error** assertion (see **Error Assertions**).
- **Sync `void` returns — never assert them at runtime.** `no-confusing-void-expression` bans a void expression _both_ inside another expression (`expect(fn())`) and as an assignment source (`const result = fn()`), so hoisting into a `const` does not silence it. The rule is enforced by oxlint (`typescript/no-confusing-void-expression`) and ships enabled through tseslint's `strictTypeChecked` as well, so both passes flag it. The lint error is a **design signal, not an obstacle**: a `void` return is a _type-level_ contract, so asserting it belongs in a `.test-d.ts` (`expectTypeOf(fn<[string]>).returns.returns.toEqualTypeOf<void>()`), while the `.test.ts` asserts only observable effects (a mock call, a mutated value). Never reach for an `oxlint-disable` here — the repo has zero of them for this rule, and a runtime `expect(result).toBeUndefined()` on a void expression is strictly weaker than the type assertion it should have been.
- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **`.toBe` for deterministic values** — when the full expected value is knowable (URL, ID, enum string), always `.toBe(fullValue)`, never `.toContain`/`.toMatch`. Inline the expected value in the `expect` call — never an intermediate `const expected*`.
- **Never fragment-match a full deterministic output** — a `.toContain`/`.toMatch` against a value fully determined by the inputs asserts one slice and ignores the rest. Assert the whole output: `.toBe(fullValue)`, else `toMatchInlineSnapshot()` (leave empty, fill with `pnpm test -u`) for bulky/multiline values. A full snapshot **subsumes** paired negative assertions — drop the `.not.toContain(...)`. Keep `.toContain` only for genuine membership on non-deterministic content (array membership, a string carrying a runtime UUID/temp path). If the whole output embeds a machine-specific path/UUID it isn't snapshot-safe — fragment-match or assert behavior portably.
- **Strip ANSI before snapshotting CLI output** — `isColorEnabled()` reads the ambient terminal/env (TTY, `FORCE_COLOR`, `NO_COLOR`), which differs between an interactive shell, `-u`, and CI, so a raw snapshot of colorized output is non-deterministic and flip-flops between color-coded and plain. Wrap the value in `stripAnsi(...)` (`@/services/cli/color/stripAnsi.test` in virrun) so the snapshot checks message content alone; coloring is verified separately in `colorize`/`isColorEnabled` tests. Narrow a `string | undefined` with `assert.exists(value)` before `stripAnsi(value)`.
- **Minimize per-test setup** — shared mutable state as `let` inside `describe`, init in `beforeEach`. Mount helpers take no arguments when state is pre-initialized.
- **Reuse utilities** — check for an existing `<helper>.test.ts` (or `<helper>.bench.ts`) beside the code under test before writing a new one. See "Test Utility Files" below.
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
- **Never re-declare a source constant/marker in a test — import it** — a test must not hardcode a literal that production code also owns: a sentinel/marker (`__VIRRUN_LOGIN_PATH_BEGIN__`), a process/cmdline marker (`VIRRUN_WSL_PROCESS_MARKER`), a temp-file prefix, a cache filename, an env-var key, etc. Import the exported constant from the source so the two can never silently drift (a copy stays green while asserting the wrong thing after the source changes). If the constant is currently module-private in the source, **export it** — promote it to the nearest `constants.ts` (matching where its siblings live, e.g. `services/exec/wsl/constants.ts`) and import it in both the source and the test. When a function takes the marker as a **parameter**, still pass the real shared constant (as `buildWslReapCommand(VIRRUN_WSL_PROCESS_MARKER)` does) rather than inventing a bespoke `"...-test-marker"` string — that keeps sibling tests consistent and the snapshot faithful to production. A genuinely test-only transform value with no production counterpart (e.g. a mock's `TEST_WSL_PREFIX`) is fine as a `*.test` constant.
- **Canonical file & directory names (filesystem tests)** — a test file or directory name carries **no meaning**; a distinct one is pure noise and a decision nobody should have to make. Where a package tests real filesystem paths, it declares one canonical file name and one canonical directory in the nearest `constants.test.ts` and uses them for **every** test path — today that's `packages/virrun` (`TEST_FILENAME = "a"`, `TEST_DIR = "/a"`, in `src/services/exec/util/constants.test.ts`). **Never invent a custom name** alongside them (`"marker"`, `"helper.cjs"`, `"dist"`, `"nested"`…); diverse names are a recurring mistake. A package with no filesystem tests needs no such constants — don't introduce them speculatively.
  - **Extension only when the code under test depends on it** (module resolution, parser/format tests) — then `` `${TEST_FILENAME}.cjs` ``. Otherwise the bare `TEST_FILENAME`.
  - **A path that must be absent** (missing-file / non-existent tests) — build it from `TEST_DIR` (the canonical non-existent dir), e.g. ``join(TEST_DIR, `${TEST_FILENAME}.cjs`)``. Never a custom `"missing.cjs"`.
  - **File content** follows the string-value convention (`""` base, `" "` for a differing value) — never a custom word like `"x"` or `"scratch"`.
  - **When two distinct paths genuinely must coexist** (e.g. a module and the dependency it requires): reuse `TEST_FILENAME` distinguished by nesting (`` `${TEST_FILENAME}/${TEST_FILENAME}.cjs` `` required by `` `${TEST_FILENAME}.cjs` ``) — never a second semantic name. Note a **bare** file `a` and a directory `a` collide, so a flat file plus a nested dir of the same bare name cannot coexist: give the flat file an extension, or test a single nested path. Prefer splitting into separate focused tests over needing two coexisting names.
  - **Real artifacts are not fixtures** — an actual on-disk name the production code owns (`pnpm-lock.yaml`, `.gitignore`, the built `dist/index.js`, the real monorepo `packages/` dir) stays its real name (use the existing constant where one exists); only invented _test_ names get canonicalised.
  - **Temp-dir prefixes and other repeated path fragments** consolidate into `constants.test.ts` the same way. Reuse across all tests; never hardcode raw path strings or diverse custom prefixes.

## Canonical Test Values

| Type            | Value(s)                                                                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean         | `"true"`, `"false"` — test both in one case                                                                                                                                                                                        |
| Integer         | `"0"` / `0`                                                                                                                                                                                                                        |
| Decimal         | `"0.1"` / `0.1`                                                                                                                                                                                                                    |
| Negative        | `"-1"` / `-1`                                                                                                                                                                                                                      |
| NaN             | `String(Number.NaN)`                                                                                                                                                                                                               |
| Date            | `"1970-01-01"`; second date: `"1970-01-02"`                                                                                                                                                                                        |
| String base     | `""` ; different value: `" "` ; use `"a"` only when space trims to `""`                                                                                                                                                            |
| Object keys     | `""` base, `" "` second — never semantic names                                                                                                                                                                                     |
| Nonexistent ID  | `"-1"` (string), `-1` (number) — never `"non-existent-id"`                                                                                                                                                                         |
| Entity fields   | Use field name as literal: `const name = "name"`. UUIDs for IDs.                                                                                                                                                                   |
| UUID/ID fields  | `const roomId = crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Never regenerate in `beforeEach` unless each test needs a unique ID (rare).                                                             |
| File / dir name | `TEST_FILENAME = "a"` / `TEST_DIR = "/a"` — never custom names (`"marker"`, `"helper.cjs"`, `"dist"`…). Extension only when the code depends on it (`` `${TEST_FILENAME}.cjs` ``). See **Canonical file & directory names** above. |

- **Date format tests** — `for...of` inside a single test using `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Interpolated descriptions** — `` `${AdminActionType.BanUser}: owner bans member — ban inserted` ``. Never write enum values as string literals in titles; always template literals with the enum reference. Plain English for non-enum cases ("integer", "decimal", "epoch date").
- **Idempotency** — always `"[functionName] is idempotent"` when repeating an operation yields the same result. Never `"deduplicates ..."`, `"does not create duplicate"`, or `"skips duplicate"`.
- **Router CRUD descriptions** — happy paths use the bare operation verb: `"creates"`, `"updates"`, `"deletes"` (one per operation, all field assertions combined). Error paths follow `"fails <operation> with <condition>"`: `"fails update with wrong user"`, `"fails delete with non-existent id"`, `"fails create with existing like"`. Never a scratch/repro label (`"creates twice"`, `"REPRO ..."`) — name the condition being rejected, not the mechanics of triggering it.

## Array / Type Utilities

- **`takeOne(arr, index)`** — instead of `arr[index]` where `noUncheckedIndexedAccess` makes it `T | undefined`. Not universal — prefer `find` when more idiomatic.
- **`assert.exists(value)`** — narrow nullable values and fail fast instead of `?? []` coalescing.
- **Cloning** — see the `typescript` skill.

## Destructuring

- Stores and composables destructure per the `pinia` skill's ordering rule — that applies in tests unchanged.
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

## Call-Count Matchers

- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`** — the canonical matcher for "called exactly once with these args" (also `toHaveBeenCalledExactlyOnceWith()` for no-arg calls). This is native Vitest and typechecks.
- **`toHaveBeenCalledOnceWith` is BANNED** — a jest-extended matcher that does NOT exist in Vitest 4. It typechecks-fails with `TS2551: Property 'toHaveBeenCalledOnceWith' does not exist`. Always use `toHaveBeenCalledExactlyOnceWith`.
- **Fallback when the exactly-once form doesn't fit** — split into `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.

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

Always a plain no-op: `new InvocationContext({ logHandler: () => {} })`. Never `vi.fn()` — its `unknown` return does not satisfy the `void`-returning `logHandler` contract.

## Error Assertions

- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, for both async (`.rejects.`) and sync (`expect(() => fn())`) throws. It captures the exact message for 100% accuracy. **BANNED in every form**: `toThrow()`, `toThrow(arg)` (string/regex/class), `.rejects.toThrow(...)`, `toThrowError(...)`, `toBeInstanceOf(...)`, and hand-rolled `try { fn(); expect.fail() } catch`. If you typed anything other than `toThrowErrorMatchingInlineSnapshot`, it is wrong.
- **Non-deterministic / OS-specific messages** — when the thrown message embeds something you cannot reconstruct portably (an absolute path that differs by OS, e.g. a Node `ENOENT` showing `C:\…` on Windows vs `/…` on Linux), do NOT snapshot the throw — it will pass locally and fail in CI. Restructure the assertion to observe the behavior portably instead (e.g. assert `fs.existsSync(path)` is `false`, or assert the returned value changed) rather than asserting the error.
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
- **Reconstruct first, empty-snapshot last.** Almost every error we throw is reproducible, so the snapshot argument should be **built from the same source of truth**, not pasted as a magic literal: our own errors via `new InvalidOperationError(...).message` (wrapped in `[ClassName: …]`), and native errors as `[TypeError: ${fn.name}: …]` / `[RangeError: …]` reusing the dynamic parts (`fn.name`, ids) directly. A reconstructed snapshot stays correct when the message format changes and reads as intentional rather than recorded. This also covers platform-gated tests skipped on the current OS — reconstruct the literal instead of leaving it empty for the other OS to fill.
- **Opaque third-party messages only** (e.g. a Zod error string you can't cleanly reconstruct) — leave the snapshot empty `toThrowErrorMatchingInlineSnapshot()` and populate it with `pnpm test -u`. This is the exception, not the default. Still never `toBeInstanceOf`.

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
- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, retry-until loops; the first two are lint-enforced via `no-restricted-syntax`). Await the real completion signal instead: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Full standard: `content/docs/architecture/no-polling.md`.

## Vitest Environment

**Every package defaults to the `node` environment**, including `packages/app`. `defineVitestProject` (`@nuxt/test-utils/config`) hardcodes `test.environment = "nuxt"` for the whole project, so `packages/app/vitest.config.ts` explicitly resets it to `"node"` after the call — `defineVitestProject` is just `resolveConfig` (all the nuxt wiring: plugins, aliases, runtime entry setup file, environmentOptions) plus that one hardcode, so the reset restores the pre-`projects`-migration `defineVitestConfig` semantics: node by default, per-file `// @vitest-environment nuxt` directives opt into the nuxt environment (the wiring stays intact, so the directive resolves).

The `// @vitest-environment nuxt` directives are **load-bearing** — never remove one without moving the test off nuxt-runtime features.

- **No directive = no DOM.** A directive-less app test runs in node: no `window`, `getIsServer()` returns `true`. To exercise a **client** path in a node-env test, stub it: `vi.stubGlobal("window", {})`; server path in any env: `vi.stubGlobal("window", undefined)` (+ `vi.unstubAllGlobals()` in `afterEach`). Prefer env-agnostic stubbing over relying on the ambient environment when the code branches on `getIsServer()`.
- **Add `// @vitest-environment nuxt` only when the test needs the nuxt runtime**: `mountSuspended`/`renderSuspended` from `@nuxt/test-utils/runtime`, or stores/composables calling `useNuxtApp()`/`useRouter()` at setup time. Apply the criteria; don't copy another file because it has the directive.
- tRPC router tests stay node-env: `createCallerFactory` is pure `@trpc/server`, and Nuxt-dependent server composables hit by middleware (e.g. `useIsProduction` → `useRuntimeConfig`) are mocked in `shared/test/setup.ts`.

**DOM comes from the nuxt environment, not setup.ts.** The nuxt environment builds its own happy-dom `window`/`document` (and `mountSuspended` attaches to its own `#test-wrapper`), so there is **no** manual happy-dom registration. `fake-indexeddb/auto` stays a global setup file: it only assigns the IDB\* global constructors the `idb` library needs, and the cache composables (`useCursorPaginationCache`/`useOffsetPaginationCache`) pull IndexedDB in transitively across many tests, so scoping it isn't worth the surface area.

## Bundle Size Snapshot Tests

Every library package (`packages/*` except `app`) has `src/index.test.ts` asserting two `getFileSize` snapshots — bundle size (`dist/index.js`) and types size (`dist/index.d.ts`), with `getFileSize` imported from `@esposter/configuration`. **Copy the file from any sibling package** rather than writing it from scratch.

- **Workflow**: create with **empty** snapshots (`toMatchInlineSnapshot()`), then `pnpm build` (the test reads compiled `dist/`) + `pnpm test --run -u` to fill them in. Re-run `-u` after any later build change.
- **New library package**: add a `test` script (`"test": "vitest"`) and `vitest` + `@types/node` devDeps. Never add `@vitest/coverage-v8` per-package — coverage runs only from the repo root, so the provider lives in the root `package.json` alone.
- **Default to the simple unguarded form.** Only split per-platform once you've **confirmed** the byte count differs across OSes (a large bundle where CRLF vs LF shifts the count) or CI fails on the other OS — never speculatively. Fill your own OS via `-u`; leave the other's snapshot empty for that OS's CI to populate.
  **Platform-specific tests generally** — gate with two `test.skipIf`/`describe.skipIf(process.platform …)` tests, one per platform, each with its own snapshot; never an in-test `if` branch. Only the matching OS's test runs, so neither asserts conditionally and no `vitest/no-conditional-expect` disable is needed. `process.platform` reads directly — no `isWindows` const.

```ts
test.skipIf(process.platform !== "win32")("bundle size (Windows)", () => { ... });
test.skipIf(process.platform === "win32")("bundle size (POSIX)", () => { ... });
```

## Running Tests

- **Tests run on Windows.** The old Vitest crash (`TypeError: The argument 'filename' must be a file URL object...`) came from `@unocss/nuxt` loading during Nuxt config resolution; `configuration/modules.ts` now uses a minimal allowlist of modules under `process.env.VITEST` (no UnoCSS/PWA/security/SEO), so the full suite runs cross-platform. If a new test needs an excluded module, add it to the Vitest branch in `modules.ts`.
- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.
- **Run the full suite, not just your new file.** A green targeted run hides regressions the full parallel run catches — above all **collateral damage from shared global state**. A sweep/mutation that is safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry): it deletes or corrupts a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.
- **A timeout in the full local run is not automatically a regression — and not a reason to add a per-test timeout.** Heavy seeded tests (hundreds of awaited caller mutations) can blow the default timeout purely from full-suite parallel load on a local machine. Rerun the file in isolation first: if it passes comfortably there and CI is green, leave the test alone — do not bump `testTimeout` or add a per-test `{ timeout }` to paper over machine load.

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

- **Audit for transitive-only coverage** — after writing the suite, ask honestly whether any branch is covered _only_ through a caller. Cover every branch of the contract including the guard clauses (the "skips non-directories" case, the no-op-when-absent case). Test a shared primitive **directly**; let its wrappers test only their unique value-add, so no branch is duplicated across primitive and wrapper.
- **Test composables, not underlying service functions** — composable tests cover the full call chain. Only test a service directly when it has no composable wrapper.
- **Don't repeat generic middleware tests** — shared middleware (auth, membership, permissions) is tested once; skip redundant UNAUTHORIZED/NotFound tests per procedure.
- **Shared procedure/subscription builders: thorough once, wiring smoke per consumer** — when endpoints are config-only instantiations of a shared builder (e.g. `getRoomEventSubscription`), the builder's full behavior matrix lives in the builder's own co-located test through ONE representative endpoint; each consuming router keeps a single happy-path wiring test. Same principle as the twin-test-files rule, applied to routers.
- **Don't test Zod schema constraints** — min/max, regex, required-field are Zod's concern.
- **Don't test trivial lookups** — a function that just indexes a constant map with a static fallback (e.g. `getSectionIcon`) needs no test; the test would restate the map. Test only functions with real logic (recursion, sorting, branching).
- **One test per operation** — combine all field assertions in a single test; don't split "updates name"/"updates bio".
- **Flat `describe` structure** — no nested `describe` for sub-grouping.

## Type-Level Tests (.test-d.ts)

- **Placement** — colocate beside the type file.
- **`describe` string** — `"{camelCaseName} type"`.
- **`test` descriptions** — enum value or type arg directly.
- **Assertion** — always `expectTypeOf(...).toEqualTypeOf<ExpectedType>()`.
- **`expect.hasAssertions()`** — in every test body.
- **Prefer type-only fixtures** — drive `expectTypeOf` from a type expression (a type alias, or `ReturnType<typeof fn>` for a non-generic fn) rather than runtime schema values or one-line helpers (prevents unused-value/underscore/value-liveness lint churn). Note `typeof fn<TypeArg>` is invalid — you can't apply type args to a `typeof` query; alias the instantiated type instead.

## Test Utility Files

Shared test helpers live in `.test.ts` files (and bench helpers in `.bench.ts`) — both suffixes are excluded from the published barrel by `ctix` and from the `tsgo` build, so they never ship. The file-organisation rules apply unchanged: **one function per file, named after the function**, never a `testUtils`-style grab-bag.

- **One helper function per file** — `createRow.test.ts` exports only `createRow`, `createWorkspaceCorpus.test.ts` only `createWorkspaceCorpus`. Follow the `create*` prefix convention for factories/builders. Cross-helper reuse is a normal import (`setupWithDataSource.test.ts` imports `createDataSource.test`).
- **Shared constants/fixtures go in `constants.test.ts` / `constants.bench.ts`** — the test/bench equivalent of the `constants.ts` exception (see the `file-organization` skill). Group module-level fixture data here (e.g. derived bench data sources) instead of one trivial file per constant. A seed constant that a helper function is built around may colocate with that function when grouping it in `constants.*` would create a circular import (the derived fixtures call the generator at module init).
- **`describe.todo` placeholder** — every helper-only `.test.ts` ends with `describe.todo("<fileName>")` (the function/file name, e.g. `describe.todo("createRow")`) so Vitest accepts the file without a real suite. Bench helper files (`.bench.ts`, `constants.bench.ts`) need no placeholder — Vitest's bench runner tolerates a file with no `bench()`.
- **`setup*` fixture helpers for repeated hook blocks** — when 2+ suites copy-paste the same `beforeEach`/`afterEach` (or `beforeAll`/`afterAll`) block, extract a `setup*` helper (`setupTemporaryCacheHome.test.ts`, `setupWarmSnapshotSuite.test.ts`, app's `setupWithDataSource`, the router suites' `setupRoomSuite`) that **registers the hooks itself** at the top of `describe` and returns getters for the state it owns (`getCacheHome()`, `getBackend()`). Suite-specific extra hooks stay in the suite — Vitest runs before-hooks in registration order (fixture's first) and after-hooks in reverse, so they compose. The file needs the usual `describe.todo`. When a getter's value is used many times per test (a caller, a per-test `roomId`), the suite aliases it into a local `let` in its own `beforeAll`/`beforeEach` rather than calling the getter at every use.
- **Twin test files → one behavior matrix + wiring tests** — when two suites are identical modulo constants (because their subjects are thin wrappers over a shared core), move the full behavior matrix to the shared core's test file; each wrapper test keeps only 1–2 wiring cases with a comment like "The generic … matrix lives in X; here only the wiring".
