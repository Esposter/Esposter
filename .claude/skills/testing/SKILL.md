---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, the shared-test-data DRY rule, takeOne/assert.exists, no unnecessary destructure, mock cleanup by creation style, call-count matchers, toThrowErrorMatchingInlineSnapshot as the only error assertion, global stubs, fake timers, the polling ban, running the full suite, and what earns a test, plus deep dives on router tests, what to mock and module doubles, the nuxt environment, platform/CLI/bundle snapshots and helper/`.test-d.ts` files. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Deep dives

- `references/router-test-setup.md` — tRPC callers, mock sessions, seeded mock-DB rows, naming a router test.
- `references/module-mocks.md` — what to mock and how: colocated `*.test.ts` doubles, `vi.mock` factories, the `db` getter, client-side tRPC calls, gating a double to prove a caller awaits it.
- `references/nuxt-environment-and-mounting.md` — a test needing a DOM, the nuxt runtime, a mounted component, or dispatching an event.
- `references/platform-and-bundle-tests.md` — a test that skips on some hosts, snapshots colorized CLI output, or asserts a built `dist` size.
- `references/test-helper-files.md` — a file that isn't a plain suite: a shared helper, a `constants.test.ts` fixture, a filesystem path name, a wrapper suite delegating its matrix, a `.test-d.ts`.

## Structure

- **`test` not `it`** — always `test(...)`.
- **`describe(functionRef, …)`** — the function reference itself; a string only when no importable reference exists. Flat — never a nested `describe` for sub-grouping.
- **Shared test constants as `const` inside the `describe` callback.** Shared mutable state is a `let` there, initialized in `beforeEach`, so mount helpers take no arguments.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — `expect` calls follow that phase's operations and locals, separated by a blank line.
- **`Promise<void>` calls — never `const result = await fn()`** (`no-confusing-void-expression`). If another assertion follows, `await fn();` bare — it already satisfies `hasAssertions()`, so `.resolves.toBeUndefined()` is ceremony; if success is the only check, that `.resolves.toBeUndefined()` is the minimal assertion, mirroring `.rejects.`. A promise resolving to a **real value** goes into a `const`.
- **Sync `void` returns — never asserted at runtime, never `oxlint-disable`d.** Hoisting into a `const` doesn't silence the rule, and only the **root** `pnpm lint` runs it, so a clean `packages/app` lint says nothing. `void` is a type-level contract: assert it in a `.test-d.ts` (`references/test-helper-files.md`).
- **Reuse utilities** — check for an existing `<helper>.test.ts` (or `<helper>.bench.ts`) beside the code under test first.
- **`create*` prefix for test factories/builders** (`createRow`). Never `make*`.

## Shared Test Data (DRY)

Never repeat a literal or object: anything used by 2+ tests (or 2+ rows of a bulk insert) is declared **once** at `describe` scope and referenced. Hard rule, not preference — but no single-use extraction; a value used once stays inline.

- **Repeated scalars and objects** — one `describe`-scope const (`const auth = ""`). Near-identical objects get a `base*` const plus spread + override (`{ ...baseMessage, userId: senderUserId }`); repeated arguments spread the constant part (`getX(db, { ...sender, message })`); uniform bulk inserts `.map()` over the varying key; event/envelope wrappers get a `create*` helper taking only the varying payload, keeping call sites type-checked (`createEvent({ … } satisfies PayloadType)`).
- **Scope correctly** — values built from `beforeAll`/`beforeEach` state stay `let`; runtime-independent ones (UUIDs, literals, static objects) are `describe`-scope `const`. Never regenerate a UUID per test unless each test needs a unique one.
- **Import a source constant, never re-declare it.** A sentinel, cmdline marker, temp-file prefix, cache filename or env-var key that production code owns comes from the source, or the copy stays green while asserting the wrong thing after the source changes. Module-private? **Export it** to the nearest `constants.ts`. Even where the marker is a **parameter**, pass the real constant. A test-only value with no production counterpart may stay a `*.test` constant.

## Canonical Test Values

- Boolean `"true"`/`"false"` — test both in one case. Integer `"0"`/`0`, decimal `"0.1"`/`0.1`, negative `"-1"`/`-1`, NaN `String(Number.NaN)`.
- Dates `"1970-01-01"`, second date `"1970-01-02"`.
- Strings: `""` base, `" "` for a different value, `"a"` only when a space trims to `""`. Object keys likewise — never semantic names.
- Nonexistent ID `"-1"` (string) / `-1` (number) — never `"non-existent-id"`. Real IDs are `crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Other entity fields use the field name as the literal: `const name = "name"`.
- Filesystem names are the canonical `TEST_FILENAME = "a"` / `TEST_DIR = "/a"` (`references/test-helper-files.md`).
- **No decorative values** — a value the code never inspects is noise: a filename is `"a"`, not `"logo.png"`. An extension or realistic word appears only where behaviour reads it (mimetype inference, a parser, trigram ranking); url-escaping tests use blob names `"a"`, `"#"`, `"?"` and nothing around them.
- **Every string literal passes one of three checks or it does not go in**: the value under test, a canonical value above, or an existing `describe`-scope constant/helper in that file. **Prose fails all three** — invented bodies, notes, titles and descriptions (`"this is spam"`) read as text a human would type, but the code matches a substring or stores an opaque blob, so everything around the tested token is decoration. Reuse the file's own message helper for a valid body, and hoist a token with its body: ``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``
- **A literal a sibling test already uses is an undeclared constant** — grep before adding a fixture; finding it inline elsewhere means hoisting it and converging those call sites in the same edit. Numbers too: a magnitude the code derives from a constant is computed from that imported constant here, never re-implemented — mirroring the source's own sizing formula asserts your own copy of it and passes when the source's changes, so assert the observable form (`Buffer.byteLength(JSON.stringify(chunk))`) instead.
- **Freeze the clock instead of asserting `toBeInstanceOf(Date)`** — `vi.useFakeTimers({ now: 0 })` plus `expect(row.createdAt).toStrictEqual(new Date(0))`. `toBeInstanceOf(Date)` restates the column type the schema guarantees and passes against a value written a day late. Works under PGlite/`createMockDb` and the Azure mocks.
- **Date format tests** — `for...of` inside one test over `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Interpolated descriptions** — `` `${AdminActionType.BanUser}: owner bans member — ban inserted` ``; never enum values as string literals in titles. Plain English otherwise ("integer", "epoch date").
- **Idempotency** — always `"[functionName] is idempotent"`. Never `"deduplicates …"`, `"does not create duplicate"`, `"skips duplicate"`.

## Assertions

- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **`.toBe(fullValue)` for anything deterministic** (URL, ID, enum string) — never `.toContain`/`.toMatch`, and inline the expected value rather than an intermediate `const expected*`.
- **Never fragment-match a deterministic output** — assert the whole of it, else `toMatchInlineSnapshot()` (leave empty, fill with `pnpm test -u`) when bulky or multiline. A full snapshot **subsumes** paired negative assertions, so drop the `.not.toContain(...)`. `.toContain` survives only for genuine membership on non-deterministic content (array membership, a string carrying a runtime UUID/temp path); output embedding a machine-specific path/UUID isn't snapshot-safe at all — fragment-match or assert behaviour portably.
- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`**, also with no args. **`toHaveBeenCalledOnceWith` is BANNED** — a jest-extended matcher absent from Vitest 4 that fails typecheck. Where it doesn't fit: `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.
- **`takeOne(arr, index)`** for `arr[index]` under `noUncheckedIndexedAccess` — not universal, prefer `find` when more idiomatic. **`assert.exists(value)`** narrows nullables and fails fast instead of `?? []`. Cloning: see the `typescript` skill.
- **No unnecessary destructure** — for plain objects, read a property directly when used once. Stores and composables keep the `pinia` skill's destructure ordering, unchanged in tests.

## Error Assertions

- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, async (`.rejects.`) and sync (`expect(() => fn())`) alike, because it captures the exact message. **BANNED in every form**: `toThrow()`, `toThrow(arg)`, `.rejects.toThrow(...)`, `toThrowError(...)`, `toBeInstanceOf(...)`, hand-rolled `try { fn(); expect.fail() } catch`.
- **Reconstruct first, empty-snapshot last.** Almost every error we throw is reproducible, so build the argument from the same source of truth rather than a pasted literal — ours as `` `[TRPCError: ${new InvalidOperationError(...).message}]` `` (or `[ClassName: …]` when thrown directly), native ones as `[TypeError: ${fn.name}: …]`, reusing the dynamic parts. It then stays correct when the message format changes, and covers a platform-gated test skipped on this OS, which is reconstructed rather than left for the other OS to fill.
- **Opaque third-party messages only** (a Zod error string you can't cleanly reconstruct) — leave the snapshot empty and populate with `pnpm test -u`. The exception, not the default; still never `toBeInstanceOf`.
- **Non-deterministic / OS-specific messages** — when the message embeds something unreconstructable portably (an absolute path in a Node `ENOENT`), do NOT snapshot the throw; it passes locally and fails in CI. Observe the behaviour portably instead (`fs.existsSync(path)` is `false`, or the returned value changed).

## Mocking

Mock the **smallest seam that makes the behaviour under test reachable**, never re-declare a mock another file already owns, and prefer driving real state to faking it — `references/module-mocks.md`. Cleanup follows **how the mock was created**:

- **`vi.spyOn()` → `vi.restoreAllMocks()`** (default) — reinstates the original implementation AND clears recorded calls, so spies never leak.
- **Module-level `vi.fn()` (colocated `vi.mock`) → `vi.clearAllMocks()`** — never a spy, so `restoreAllMocks` leaves its call history to **leak into the next test**. Required wherever `toHaveBeenCalled*` is asserted on one across multiple tests. A file mixing both needs both calls.
- **Never `vi.resetAllMocks()` as routine cleanup** — it resets implementations to empty functions, erasing intentional `vi.mock` defaults.
- **Globals use `vi.stubGlobal`**, never `Object.defineProperty`. Unstub with `vi.unstubAllGlobals()` in `afterEach` (stubs set per-test) or `afterAll` (set once in `beforeAll`). `vi.restoreAllMocks()` does **not** undo a `stubGlobal`.

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately. Use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers** — `vi.useFakeTimers({ now: 0 })` in `beforeEach`, `vi.useRealTimers()` in `afterEach`. One call, never `useFakeTimers()` + `setSystemTime(0)`: `now` pins the clock at install rather than leaving it briefly real. `vi.setSystemTime` only _moves_ time inside a test, `vi.advanceTimersByTime` elapses timers, and `Date` is faked already — no `toFake` unless a test asserts non-Date timer behaviour.
- **Even a clock only one test needs is restored in the suite's `afterEach`**, never beside the assertion: a `vi.useRealTimers()` after an `await expect(...)` is skipped the moment that assertion rejects, and every later test inherits a frozen clock and fails for a reason none of them contain. Cleanup is unconditional, like DB rows and global stubs.
- **Never force past/future time with large arbitrary offsets** — `Date.now() + 999_999_999`, `slowmodeMs: 999_999_999` are banned (unstable, unreadable). Against a pinned clock use the minimal offset: `new Date(Date.now() + 1)`, `slowmodeMs: 1` + `lastMessageAt: new Date()` for "no time elapsed", `vi.advanceTimersByTime(1)` when time must pass.
- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, retry-until loops; the first two lint-enforced via `no-restricted-syntax`). Await the real completion signal: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Full standard: `content/docs/architecture/no-polling.md`. To prove a caller awaits its own side effect, gate a double and drain one boundary — `references/module-mocks.md`.

## Running Tests

- **Tests run on Windows** — a test needing a Nuxt module excluded from the `process.env.VITEST` allowlist adds it in `configuration/modules.ts`.
- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.
- **Run the full suite, not just your new file** — a green targeted run hides regressions the parallel run catches, above all **collateral damage from shared global state**: a sweep safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry), destroying a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.
- **A full-run timeout is not automatically a regression — and never a reason to add a per-test timeout.** Heavy seeded tests can blow the default from parallel load alone. Rerun the file in isolation: passing comfortably there with CI green means leave it, never bump `testTimeout` or add `{ timeout }`.

## What to Test

**Every test earns its line or it is deleted** — it earns it by failing when behaviour a caller or user depends on breaks, and nothing else counts. Delete on sight, including tests already in the tree: one asserting a constant's literal value or restating a map/schema (it fails only on a deliberate edit, and the diff is the review — unless the literal is fixed outside this repo, e.g. a wire/protocol value, a security limit or a retention window, where catching that edit is the point), one whose subject is now the mock's behaviour rather than ours, and one re-covering a branch another test already covers. Fewer, wider tests beat many narrow ones: fold a near-duplicate into the test it shadows by widening that test's fixture. Removing a test a change made redundant is part of the change.

- **Never add production API for a test's benefit** — before building a completion signal, reset hook or inspection getter onto a primitive, grep for who else would call it; "only the test" means the signal almost certainly exists already (fire-and-forget work is drained by `waitForSynchronizedFunctions()`, so a composable whose operations all go through `getSynchronizedFunction` returns nothing at all). A test-only export means you are testing the wrong seam, or re-inventing a drain the repo owns.
- **Audit for transitive-only coverage** — after writing the suite, ask honestly whether a branch is covered _only_ through a caller. Cover every branch of the contract, guard clauses included (the "skips non-directories" case, the no-op-when-absent case). Test a shared primitive **directly**; its wrappers test only their unique value-add, in the shape `references/test-helper-files.md` prescribes.
- **Test composables, not the service functions under them** — composable tests cover the full call chain; test a service directly only when it has no composable wrapper.
- **Don't test Zod schema constraints** — min/max, regex, required-field are Zod's concern.
- **Don't test trivial lookups** — a function that just indexes a constant map with a static fallback would only restate the map; test functions with real logic (recursion, sorting, branching).
- **One test per operation** — all field assertions combined; don't split "updates name"/"updates bio".
