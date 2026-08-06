---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values and the shared-test-data DRY rule, takeOne for unsafe index access, no unnecessary destructure, what to mock and mock cleanup by creation style, call-count matchers, toThrowErrorMatchingInlineSnapshot as the only error assertion, global stubs, fake timers and the repo-wide polling ban, running the full suite, what earns a test at all, plus deep dives on tRPC caller/mock-session/DB setup, vi.mock module doubles and msw-trpc, the node-default environment and mountSuspended, capability/platform skip gating and bundle-size snapshots, and helper/fixture/`.test-d.ts` files. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Deep dives

- `references/router-test-setup.md` — when a test drives tRPC callers, queues mock sessions, or seeds rows into the mock DB.
- `references/module-mocks.md` — when a test mocks a module: a colocated `*.test.ts` double, a `vi.mock` factory, the `db` getter, or a client-side tRPC call.
- `references/nuxt-environment-and-mounting.md` — when a test needs a DOM, the nuxt runtime, a mounted component, or dispatches an event.
- `references/platform-and-bundle-tests.md` — when a test skips on some platforms or hosts, or asserts a package's built `dist` size.
- `references/test-helper-files.md` — when writing a file that isn't a plain suite: a shared helper, a `constants.test.ts` fixture, a filesystem path name, or a `.test-d.ts`.

## Structure

- **`test` not `it`** — always `test(...)`.
- **`describe(functionRef, ...)`** — pass the function reference directly; use a string only when no importable reference exists. **Flat `describe` structure** — no nested `describe` for sub-grouping.
- **Declare `const` inside `describe`** — all shared test constants scoped inside the `describe` callback.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — put all `expect` calls after all operations/local assignments for that phase, separated by a blank line.
- **`Promise<void>` calls — never assign into a `const`** (`const result = await fn()` trips `no-confusing-void-expression`). When another assertion already follows in the same test, just `await fn();` as a bare statement — the trailing assertion satisfies `hasAssertions()`, and a `.resolves.toBeUndefined()` there is pure ceremony. When success is the only thing checked, `await expect(fn()).resolves.toBeUndefined();` — the minimal positive assertion and the mirror of the `.rejects.` case. When the promise resolves to a **real value**, `await` into a `const` and assert on it.
- **Sync `void` returns — never assert them at runtime.** `no-confusing-void-expression` bans a void expression both inside another expression (`expect(fn())`) and as an assignment source, so hoisting into a `const` does not silence it. It is enforced by oxlint (`typescript/no-confusing-void-expression`) in the **root** `pnpm lint` only — ESLint runs no type-aware rule any more, so a clean `pnpm lint:fix` in `packages/app` says nothing about it. Treat the error as a design signal: a `void` return is a _type-level_ contract, so assert it in a `.test-d.ts` (`expectTypeOf(fn<[string]>).returns.returns.toEqualTypeOf<void>()`) while the `.test.ts` asserts only observable effects. Never an `oxlint-disable` here.
- **Minimize per-test setup** — shared mutable state as `let` inside `describe`, init in `beforeEach`. Mount helpers take no arguments when state is pre-initialized.
- **Reuse utilities** — check for an existing `<helper>.test.ts` (or `<helper>.bench.ts`) beside the code under test before writing a new one.
- **`create*` prefix for test helpers** — all factory/builder functions (`createRow`, `createColumn`). Never `make*`.

## Shared Test Data (DRY)

Never repeat the same literal value or object across tests. If 2+ tests (or rows in a bulk insert) use the same thing, declare it **once** at `describe` scope and reference it. Hard rule, not preference — but **no single-use extraction**: a value used once stays inline.

- **Repeated scalars and objects** — declare once at `describe` scope (`const auth = ""`, `const endpoint = "http://mock-endpoint"`) and reference everywhere.
- **Near-identical objects** — a `base*` const for the shared fields, then spread + override the differing one: `const standardMessage = { ...baseMessage, userId: senderUserId }`.
- **Repeated call arguments** — declare the constant part once and spread: `getX(db, { ...sender, message })`.
- **Uniform bulk inserts** — `.map()` over the varying key instead of repeating the row literal.
- **Repeated event/envelope wrappers** — extract a `create*` helper taking only the varying payload, so call sites pass `createEvent({ ... } satisfies PayloadType)` and the payload stays type-checked.
- **Scope correctly** — values built from `beforeAll`/`beforeEach` state stay as `let`; runtime-independent values (UUIDs, literals, static objects) go at `describe` scope as `const`. Never regenerate a UUID per test unless each test needs a unique one.
- **Never re-declare a source constant/marker in a test — import it.** A sentinel, process/cmdline marker, temp-file prefix, cache filename or env-var key that production code owns must be imported from the source, or the copy stays green while asserting the wrong thing after the source changes. If it is module-private, **export it** — promote it to the nearest `constants.ts` beside its siblings and import it in both places. When a function takes the marker as a **parameter**, still pass the real shared constant rather than inventing a bespoke test string. A genuinely test-only transform value with no production counterpart is fine as a `*.test` constant.

## Canonical Test Values

| Type            | Value(s)                                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean         | `"true"`, `"false"` — test both in one case                                                                                                                            |
| Integer         | `"0"` / `0`                                                                                                                                                            |
| Decimal         | `"0.1"` / `0.1`                                                                                                                                                        |
| Negative        | `"-1"` / `-1`                                                                                                                                                          |
| NaN             | `String(Number.NaN)`                                                                                                                                                   |
| Date            | `"1970-01-01"`; second date: `"1970-01-02"`                                                                                                                            |
| String base     | `""` ; different value: `" "` ; use `"a"` only when space trims to `""`                                                                                                |
| Object keys     | `""` base, `" "` second — never semantic names                                                                                                                         |
| Nonexistent ID  | `"-1"` (string), `-1` (number) — never `"non-existent-id"`                                                                                                             |
| Entity fields   | Use field name as literal: `const name = "name"`. UUIDs for IDs.                                                                                                       |
| UUID/ID fields  | `const roomId = crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Never regenerate in `beforeEach` unless each test needs a unique ID (rare). |
| File / dir name | `TEST_FILENAME = "a"` / `TEST_DIR = "/a"` — never custom names; extension only when the code depends on it (`references/test-helper-files.md`).                        |

- **No decorative values.** A value the code never inspects is noise: a filename is `"a"`, not `"logo.png"`. Carry an extension or a realistic word **only** where behaviour reads it (mimetype inference, a CSV/JSON parser, trigram ranking). Same for blob names: to test url escaping, the names are `"a"`, `"#"`, `"?"` — the character under test and nothing around it.
- **Every string literal in a test passes one of three checks — otherwise it does not go in.** It is (1) the value under test, (2) the canonical value from the table, or (3) an existing `describe`-scope constant or helper in that file. **Prose fails all three**: message bodies, notes, titles and descriptions attract invented sentences (`"this is spam"`, `"hello world"`) precisely because they read as text a human would type — but the code matches a substring or stores an opaque blob, so the sentence around the tested token is decoration. Reuse the file's own message helper for "some valid body", and where a token must appear in it, hoist the token and its body to `describe` scope together (``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``).
- **A literal a sibling test already uses is a constant that was never declared.** Grep the file before adding a fixture: finding it inline elsewhere means hoisting it and converging those call sites in the same edit, not adding a third copy. Numbers earn the same treatment — a magnitude the code derives from a constant is computed from that imported constant in the test too.
- **Arithmetic the source performs is imported, never mirrored.** A test that re-implements the source's own sizing (`+ 3` for quotes and a comma) asserts its own copy of the formula and passes when the source's changes; assert the observable form instead (`Buffer.byteLength(JSON.stringify(chunk))`) or import the constant.
- **Freeze the clock instead of asserting `toBeInstanceOf(Date)`.** A timestamp stamped from `new Date()` is fully determined once the clock is, so `vi.useFakeTimers({ now: 0 })` plus `expect(row.createdAt).toStrictEqual(new Date(0))`. `toBeInstanceOf(Date)` asserts the column's type, which the schema already guarantees, and passes against a value written a day late. This works under PGlite/`createMockDb` and the Azure mocks.
- **Date format tests** — `for...of` inside a single test using `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Interpolated descriptions** — `` `${AdminActionType.BanUser}: owner bans member — ban inserted` ``. Never write enum values as string literals in titles. Plain English for non-enum cases ("integer", "decimal", "epoch date").
- **Idempotency** — always `"[functionName] is idempotent"`. Never `"deduplicates ..."`, `"does not create duplicate"`, `"skips duplicate"`.
- **Router CRUD descriptions** — happy paths use the bare verb (`"creates"`, `"updates"`, `"deletes"`), one per operation with all field assertions combined. Error paths follow `"fails <operation> with <condition>"`. Never a scratch/repro label — name the condition being rejected, not the mechanics of triggering it.

## Assertions

- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **`.toBe` for deterministic values** — when the full expected value is knowable (URL, ID, enum string), always `.toBe(fullValue)`, never `.toContain`/`.toMatch`. Inline the expected value in the `expect` call — never an intermediate `const expected*`.
- **Never fragment-match a full deterministic output** — assert the whole output: `.toBe(fullValue)`, else `toMatchInlineSnapshot()` (leave empty, fill with `pnpm test -u`) for bulky/multiline values. A full snapshot **subsumes** paired negative assertions — drop the `.not.toContain(...)`. Keep `.toContain` only for genuine membership on non-deterministic content (array membership, a string carrying a runtime UUID/temp path). If the whole output embeds a machine-specific path/UUID it isn't snapshot-safe — fragment-match or assert behavior portably.
- **Strip ANSI before snapshotting CLI output** — `isColorEnabled()` reads the ambient terminal/env (TTY, `FORCE_COLOR`, `NO_COLOR`), so a raw snapshot of colorized output flip-flops between an interactive shell, `-u` and CI. Wrap the value in `stripAnsi(...)` (`@/services/cli/color/stripAnsi.test` in virrun) so the snapshot checks message content alone; coloring is verified in the `colorize`/`isColorEnabled` tests. Narrow a `string | undefined` with `assert.exists(value)` first.
- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`** — the canonical matcher (also with no args). **`toHaveBeenCalledOnceWith` is BANNED**: a jest-extended matcher that does not exist in Vitest 4 and fails typecheck. When the exactly-once form doesn't fit, split into `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.
- **`takeOne(arr, index)`** instead of `arr[index]` where `noUncheckedIndexedAccess` makes it `T | undefined` — not universal, prefer `find` when more idiomatic. **`assert.exists(value)`** to narrow nullable values and fail fast instead of `?? []` coalescing. Cloning: see the `typescript` skill.
- **No unnecessary destructure** — for plain objects (not stores/composables), access a property directly when used only once. Stores and composables destructure per the `pinia` skill's ordering rule, unchanged in tests.

## Error Assertions

- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, for both async (`.rejects.`) and sync (`expect(() => fn())`) throws. It captures the exact message. **BANNED in every form**: `toThrow()`, `toThrow(arg)`, `.rejects.toThrow(...)`, `toThrowError(...)`, `toBeInstanceOf(...)`, and hand-rolled `try { fn(); expect.fail() } catch`.
- **Reconstruct first, empty-snapshot last.** Almost every error we throw is reproducible, so build the snapshot argument from the same source of truth rather than pasting a magic literal — our own errors as `` `[TRPCError: ${new InvalidOperationError(...).message}]` `` (or `[ClassName: …]` for a direct throw), native errors as `[TypeError: ${fn.name}: …]`, reusing the dynamic parts (ids, `fn.name`) directly. A reconstructed snapshot stays correct when the message format changes and reads as intentional rather than recorded. This also covers platform-gated tests skipped on the current OS — reconstruct the literal instead of leaving it empty for the other OS to fill.
- **Opaque third-party messages only** (e.g. a Zod error string you can't cleanly reconstruct) — leave `toThrowErrorMatchingInlineSnapshot()` empty and populate with `pnpm test -u`. The exception, not the default. Still never `toBeInstanceOf`.
- **Non-deterministic / OS-specific messages** — when the message embeds something unreconstructable portably (an absolute path differing by OS, e.g. a Node `ENOENT`), do NOT snapshot the throw; it passes locally and fails in CI. Observe the behavior portably instead (assert `fs.existsSync(path)` is `false`, or that the returned value changed).

## What to Mock

Mock the **smallest seam that makes the behaviour under test reachable**, and never re-declare a mock another file already owns.

- **Prefer driving state over mocking a getter** — a store's derived state usually has a real input to set (`router.currentRoute.value.params.id = roomId` gives the room stores a current room). `vi.spyOn(store, "prop", "get")` breaks `storeToRefs`, which reads the underlying ref rather than the spied accessor.
- **Mock a module only for what the environment genuinely cannot do** — a canvas downscale, a network PUT, a clock. If a fake is only saving setup lines, build the real input instead.

## Mock Cleanup

Pick cleanup based on **how the mock was created**:

- **`vi.spyOn()` mocks → `vi.restoreAllMocks()`** (default) — reinstates the original implementation AND clears recorded calls, so spies never leak.
- **Module-level `vi.fn()` mocks (colocated `vi.mock`) → `vi.clearAllMocks()`** — `restoreAllMocks` only restores spied implementations; a standalone `vi.fn()` was never a spy, so its call history **leaks into the next test**. Required in any test asserting `toHaveBeenCalled*` on a module-level `vi.fn()` across multiple tests. A file mixing both needs both calls; neither alone covers the other.
- **Never `vi.resetAllMocks()` as routine cleanup** — it resets implementations to empty functions, erasing intentional `vi.mock` defaults.
- **Globals use `vi.stubGlobal`** — never `Object.defineProperty`. Unstub with `vi.unstubAllGlobals()` in `afterEach` (stubs set per-test) or `afterAll` (set once in `beforeAll`). `vi.restoreAllMocks()` does **not** undo a `stubGlobal`.

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately. Use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers** — `vi.useFakeTimers({ now: 0 })` in `beforeEach`, `vi.useRealTimers()` in `afterEach`. One call, never `useFakeTimers()` + `setSystemTime(0)`: the `now` pins the clock at install rather than leaving it briefly real. `vi.setSystemTime` is only for _moving_ time inside a test, `vi.advanceTimersByTime` for elapsing timers, and `vi.useFakeTimers()` already fakes `Date` so no `toFake` option is needed unless a test asserts specific non-Date timer behavior.
- **When only one test needs to move the clock**, fake it in that test but still restore in the suite's `afterEach` — never beside the assertion. A `vi.useRealTimers()` written after an `await expect(...)` is skipped the moment that assertion rejects, and every later test inherits a frozen clock and fails for a reason none of them contain. The restore is unconditional or it is not cleanup — the same reason DB rows and global stubs are torn down in `afterEach`.
- **Never force past/future time with large arbitrary offsets** — `new Date(Date.now() + 999_999_999)` or `slowmodeMs: 999_999_999` are banned (unstable, unreadable). With a pinned clock use the minimal offset: `new Date(Date.now() + 1)`, `slowmodeMs: 1` + `lastMessageAt: new Date()` for "no time elapsed", `vi.advanceTimersByTime(1)` when time must pass.
- **To prove something is awaited, gate it and drain once.** An ordering contract ("the caller does not return until its side effect is durable") is untestable by observing the side effect afterwards — every assertion that reads it `await`s something first, handing the fire-and-forget chain the turns it needed, so the test passes against the bug. Make the dependency block instead: stub the client so the write returns a promise the test resolves by hand, start the call without awaiting it, drain past one timer boundary (`await new Promise((resolve) => { setTimeout(resolve); })`), and assert the caller has **not** settled; then release and await it. A single one-shot boundary flushes every pending microtask and re-checks nothing, so it is not polling. Verify the test fails against the un-awaited version before keeping it.
- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, retry-until loops; the first two are lint-enforced via `no-restricted-syntax`). Await the real completion signal: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Full standard: `content/docs/architecture/no-polling.md`.

## Running Tests

- **Tests run on Windows.** The old Vitest crash (`TypeError: The argument 'filename' must be a file URL object...`) came from `@unocss/nuxt` loading during Nuxt config resolution; `configuration/modules.ts` now uses a minimal allowlist of modules under `process.env.VITEST`, so the full suite runs cross-platform. If a new test needs an excluded module, add it to the Vitest branch in `modules.ts`.
- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.
- **Run the full suite, not just your new file.** A green targeted run hides regressions the full parallel run catches — above all **collateral damage from shared global state**. A sweep/mutation that is safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry): it deletes or corrupts a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.
- **A timeout in the full local run is not automatically a regression — and not a reason to add a per-test timeout.** Heavy seeded tests can blow the default timeout purely from full-suite parallel load. Rerun the file in isolation first: if it passes comfortably there and CI is green, leave it alone — never bump `testTimeout` or add a per-test `{ timeout }` to paper over machine load.

## What to Test

**Every test earns its line or it is deleted.** A test earns it by failing when behaviour a caller or user depends on breaks — nothing else counts. Delete on sight, including tests already in the tree: one that asserts a constant's literal value or restates a map/schema (it fails only when someone edits the value on purpose, and the diff is the review — unless the literal is fixed by something outside this repo, e.g. a wire/protocol value, a security limit or a retention window, where catching that deliberate edit is exactly the point), one whose subject is now the mock's behaviour rather than ours, and one that re-covers a branch another test in the suite already covers. Fewer, wider tests beat many narrow ones: fold a near-duplicate into the test it shadows by widening that test's fixture. When a change makes a test redundant, removing it is part of the change.

- **Never add production API for a test's benefit.** Before building a completion signal, a reset hook, or an inspection getter onto a primitive, grep for who else would call it: if the answer is "only the test", the signal you want almost certainly exists already. Fire-and-forget work is drained by `waitForSynchronizedFunctions()`, so a composable whose operations all go through `getSynchronizedFunction` needs to return nothing at all. A test-only export is a signal you are testing the wrong seam, or re-inventing a drain the repo already owns.
- **Audit for transitive-only coverage** — after writing the suite, ask honestly whether any branch is covered _only_ through a caller. Cover every branch of the contract including the guard clauses (the "skips non-directories" case, the no-op-when-absent case). Test a shared primitive **directly**; let its wrappers test only their unique value-add.
- **A wrapper's test states where the matrix lives.** When a file covers only its own delta because a primitive owns the rest, say so in a header comment naming the owning test file — `// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the MJML markup flavour`. Without it the next reader cannot tell a deliberately narrow suite from a thin one and fills the gap with duplicates. The comment also decays: a file carrying the pointer while still asserting the delegated matrix is a duplicate to delete, not a comment to update.
- **Test composables, not underlying service functions** — composable tests cover the full call chain. Only test a service directly when it has no composable wrapper.
- **Don't repeat generic middleware tests** — shared middleware (auth, membership, permissions) is tested once; skip redundant UNAUTHORIZED/NotFound tests per procedure.
- **Shared procedure/subscription builders: thorough once, wiring smoke per consumer** — when endpoints are config-only instantiations of a shared builder (e.g. `getRoomEventSubscription`), the builder's full behavior matrix lives in its own co-located test through ONE representative endpoint; each consuming router keeps a single happy-path wiring test.
- **Don't test Zod schema constraints** — min/max, regex, required-field are Zod's concern.
- **Don't test trivial lookups** — a function that just indexes a constant map with a static fallback needs no test; it would restate the map. Test only functions with real logic (recursion, sorting, branching).
- **One test per operation** — combine all field assertions in a single test; don't split "updates name"/"updates bio".
