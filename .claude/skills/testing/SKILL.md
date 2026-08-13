---
name: testing
description: Esposter Vitest testing conventions — describe with function refs, canonical test values, the shared-test-data DRY rule, takeOne/assert.exists, no unnecessary destructure, mock cleanup by creation style, call-count matchers, toThrowErrorMatchingInlineSnapshot as the only error assertion, global stubs, the polling ban, running the full suite, what earns a test, plus deep dives on router tests, what to mock and module doubles, the nuxt environment, platform/CLI/bundle snapshots, full-run failures, helper/`.test-d.ts` files, and fake timers with hand-resolved promises. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Deep dives

- `references/router-test-setup.md` — tRPC callers, mock sessions, seeded mock-DB rows, naming a router test.
- `references/module-mocks.md` — what to mock; colocated doubles, `vi.mock` factories, the `db` getter, client tRPC calls, gating a double to prove a caller awaits it.
- `references/nuxt-environment-and-mounting.md` — a DOM, the nuxt runtime, a mounted component, a routed link, a dispatched event.
- `references/platform-and-bundle-tests.md` — skipping on some hosts, colorized CLI output, a built `dist` size.
- `references/test-helper-files.md` — anything that isn't a plain suite: shared helpers, `constants.test.ts` fixtures, filesystem path names, a wrapper suite delegating its matrix, `.test-d.ts`.
- `references/running-the-suite.md` — a failure or timeout only the full parallel run produces, and the Windows module allowlist.
- `references/timers-and-hand-resolved-promises.md` — fake timers, a pinned clock, throttled code, or a call held in flight.

## Structure

- **`test` not `it`** — always `test(...)`.
- **`describe(functionRef, …)`** — the function reference itself; a string only when no importable reference exists. Flat — never a nested `describe` for sub-grouping.
- **Shared test constants as `const` inside the `describe` callback.** State that must be rebuilt per test (a mock DB, a wrapper to unmount, a store) is a `let` there, initialized in `beforeEach` — a helper reads it rather than taking it as an argument. That is scoped to rebuilt-per-test state: an input that simply **differs between tests** stays a parameter (`mountFoo(route, activeCategory)`), never a `let` assigned before each call, which would manufacture the shared mutable state the rule exists to contain.
- **`test.each` for a table of cases, never a loop around `test`** (`no-restricted-syntax`). A loop registers every case under one name, so the reporter shows one row and `pnpm test -t` cannot select a single case; `.each` names each row and a failure says which input produced it. The title takes `%s` rather than a template literal — the interpolation is the runner's job, and it is what makes the row title match the case. A table of **enum members** needs `as const`: without it the array widens to the enum, and any discriminated union the case feeds rejects it.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — `expect` calls follow that phase's operations and locals, separated by a blank line.
- **A `void` return is never assigned or asserted at runtime** (`no-confusing-void-expression`, caught by the **root** `pnpm lint` alone since `packages/app`'s ESLint isn't type-aware; never disabled). For a `Promise<void>`: `await fn();` bare when another assertion follows, else `await expect(fn()).resolves.toBeUndefined();`. One resolving to a **real value** goes into a `const`; a sync `void` contract is asserted in a `.test-d.ts` (`references/test-helper-files.md`).
- **Reuse utilities, and prefix factories `create*`** — look for an existing `<helper>.test.ts` (or `<helper>.bench.ts`) beside the code under test first; factories/builders are `createRow`, never `make*`.

## Shared Test Data (DRY)

Never repeat a literal or object: anything used by 2+ tests (or 2+ rows of a bulk insert) is declared **once** at `describe` scope and referenced. Hard rule — but no single-use extraction; a value used once stays inline.

- **Repeated scalars and objects** — one `describe`-scope const (`const auth = ""`). Near-identical objects: a `base*` const plus spread + override (`{ ...baseMessage, userId: senderUserId }`). Repeated arguments: spread the constant part (`getX(db, { ...sender, message })`). Uniform bulk inserts: `.map()` over the varying key. Event/envelope wrappers: a `create*` helper taking only the varying payload, so call sites stay type-checked (`createEvent({ … } satisfies PayloadType)`).
- **Scope correctly** — values built from `beforeAll`/`beforeEach` state stay `let`; runtime-independent ones (UUIDs, literals, static objects) are `describe`-scope `const`. Never regenerate a UUID per test unless each test needs a unique one.
- **Never re-declare what exists — import or hoist it.** A literal a sibling test uses inline is an undeclared constant: grep before adding a fixture, then hoist it and converge those call sites in the same edit. A sentinel, cmdline marker, temp-file prefix, cache filename or env-var key production code owns is imported from the source, or the copy stays green while asserting the wrong thing after the source changes — module-private, **export it** to the nearest `constants.ts`; taken as a **parameter**, still pass the real constant. Numbers too: mirroring the source's sizing formula asserts your copy of it, so compute from the imported constant or assert the observable form (`Buffer.byteLength(JSON.stringify(chunk))`). Only a test-only value with no production counterpart stays a `*.test` constant.

## Canonical Test Values

- Boolean `"true"`/`"false"` (both in one case), integer `"0"`/`0`, decimal `"0.1"`/`0.1`, negative `"-1"`/`-1`, NaN `String(Number.NaN)`, dates `"1970-01-01"` then `"1970-01-02"`.
- Strings: `""` base, `" "` for a different value, `"a"` only when a space trims to `""`. Object keys likewise — never semantic names.
- Nonexistent ID `"-1"` (string) / `-1` (number) — never `"non-existent-id"`. Real IDs are `crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Other entity fields use the field name as the literal: `const name = "name"`. Filesystem names are the canonical `TEST_FILENAME = "a"` / `TEST_DIR = "/a"` (`references/test-helper-files.md`).
- **Every string literal passes one of three checks or it does not go in**: the value under test, a canonical value above, or an existing `describe`-scope constant/helper in that file. Anything else is decoration the code never inspects — a filename is `"a"`, not `"logo.png"` (an extension or realistic word only where behaviour reads it: mimetype inference, a parser, trigram ranking; url-escaping tests use `"a"`, `"#"`, `"?"` alone). **Prose fails all three**: an invented body, note, title or description reads as text a human would type, but the code only matches a substring or stores a blob. Reuse the file's message helper for a valid body; hoist a token with its body: ``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``
- **Freeze the clock instead of asserting `toBeInstanceOf(Date)`** — `vi.useFakeTimers({ now: 0 })` plus `expect(row.createdAt).toStrictEqual(new Date(0))`; the instance check only restates the schema's column type and passes against a value written a day late. Works under PGlite/`createMockDb` and the Azure mocks.
- **Date format tests** — `for...of` inside one test over `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Descriptions interpolate enum values** — `` `${FooType.Bar}: <plain-English outcome>` ``, never the literal; plain English otherwise ("integer", "epoch date"). Idempotency is always `"[functionName] is idempotent"`, never `"deduplicates …"`/`"does not create duplicate"`/`"skips duplicate"`.

## Assertions

- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **Never fragment-match a deterministic output** — assert the whole value with `.toBe(fullValue)` (URL, ID, enum string), inlined in the `expect` call rather than an intermediate `const expected*`; `toMatchInlineSnapshot()` (empty, filled with `pnpm test -u`) when it is bulky or multiline. A full snapshot **subsumes** paired negative assertions, so drop the `.not.toContain(...)`. `.toContain`/`.toMatch` survive only for genuine membership on non-deterministic content (array membership, a runtime UUID or temp path); output embedding a machine-specific path isn't snapshot-safe — fragment-match or assert behaviour portably.
- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`**, also with no args. **`toHaveBeenCalledOnceWith` is BANNED** — jest-extended, absent from Vitest 4, fails typecheck. Where it doesn't fit: `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.
- **`takeOne(arr, index)`** for `arr[index]` under `noUncheckedIndexedAccess` — not universal, prefer `find` when more idiomatic. **`assert.exists(value)`** narrows nullables and fails fast instead of `?? []`. Cloning: see the `typescript` skill.
- **No unnecessary destructure** — for plain objects, read a property directly when used once. Stores and composables keep the `pinia` skill's destructure ordering, unchanged in tests.

## Error Assertions

- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, async (`.rejects.`) and sync (`expect(() => fn())`) alike: it captures the exact message. **BANNED**: `toThrow()`, `toThrow(arg)`, `.rejects.toThrow(...)`, `toThrowError(...)`, `toBeInstanceOf(...)`, hand-rolled `try { fn(); expect.fail() } catch`.
- **Reconstruct first, empty-snapshot last.** Almost every error we throw is reproducible, so build the argument from the same source of truth, not a pasted literal — ours as `` `[TRPCError: ${new InvalidOperationError(...).message}]` `` (or `[ClassName: …]` when thrown directly), native ones as `[TypeError: ${fn.name}: …]`, reusing the dynamic parts. It survives a message-format change, and covers a platform-gated test skipped on this OS.
- **Opaque third-party messages only** (a Zod error string you can't cleanly reconstruct) — leave the snapshot empty and populate with `pnpm test -u`. The exception, not the default; still never `toBeInstanceOf`. A message no one can reconstruct portably is not snapshotted at all — `references/platform-and-bundle-tests.md`.
- **An inline snapshot belongs to its call site, so a `test.each` row cannot carry its own.** Every row of a table runs the same `expect` line, and vitest rejects a second, different snapshot there ("with different snapshots cannot be called at the same location"). A table whose rows share one message is fine — `[TRPCError: UNAUTHORIZED]` across six permission-gated procedures is the usual shape. Twin suites that differ **in the message** (`Must be call creator to admit knockers` / `…to dismiss knockers`) stay written out: the message naming the operation is what each row would be proving, and it is the half a table cannot express.

## Mocking

Mock the **smallest seam that makes the behaviour reachable**, never re-declare a mock another file owns, prefer driving real state to faking it — `references/module-mocks.md`. Cleanup follows **how the mock was created**:

- **`vi.spyOn()` → `vi.restoreAllMocks()`** (default) — restores the original implementation AND clears recorded calls, so spies never leak.
- **Module-level `vi.fn()` (colocated `vi.mock`) → `vi.clearAllMocks()`** — never a spy, so `restoreAllMocks` lets its call history **leak into the next test**. Required wherever `toHaveBeenCalled*` is asserted on one across tests; a file mixing both kinds needs both calls.
- **Never `vi.resetAllMocks()` as routine cleanup** — it resets implementations to empty functions, erasing intentional `vi.mock` defaults.
- **Globals use `vi.stubGlobal`**, never `Object.defineProperty`; unstub with `vi.unstubAllGlobals()` in `afterEach` (per-test stubs) or `afterAll` (set once in `beforeAll`). `vi.restoreAllMocks()` does **not** undo a `stubGlobal`.
- **`vi.stubEnv` needs no teardown** — `unstubEnvs: true` in `getVitestConfiguration` restores the env after every test, so never write an `unstubAllEnvs` hook. The globals flag stays off deliberately: it would restore a `beforeAll` `stubGlobal` after the file's first test.
- **A test must never read a color/TTY env var it did not stub.** `isColorEnabled` consults `NO_COLOR`/`FORCE_COLOR`, so an ambient one from the dev's shell repaints CLI output; virrun's `vitest.config.ts` pins both empty for the package, and a test wanting color stubs `FORCE_COLOR` itself.

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately; use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers, and any promise the test resolves by hand, follow `references/timers-and-hand-resolved-promises.md`** — one `vi.useFakeTimers({ now: 0 })` in `beforeEach` with an unconditional restore in `afterEach`, `toFake` narrowed rather than widened, and `Promise.withResolvers` instead of a `let` closed over by an executor.
- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, retry-until loops; the first two lint-enforced via `no-restricted-syntax`). Await the real completion signal: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Standard: `content/docs/architecture/no-polling.md`. To prove a caller awaits its own side effect, gate a double and drain one boundary — under fake timers that boundary is `await vi.advanceTimersByTimeAsync(0)`, never a bare `setTimeout` promise nor the sync `vi.advanceTimersByTime` (`references/module-mocks.md`).

## Running Tests

- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.
- **Run the full suite, not just your new file** — a green targeted run hides shared-global-state regressions the parallel run catches, and a full-run timeout is not automatically one (never bump `testTimeout` over it). Reading those failures, and the Windows module allowlist: `references/running-the-suite.md`.

## What to Test

**Every test earns its line or it is deleted** — it earns it only by failing when behaviour a caller or user depends on breaks. Delete on sight, new and existing alike: one asserting a constant's literal value or restating a map/schema (it fails only on a deliberate edit and the diff is the review — unless the literal is fixed outside this repo: a wire/protocol value, security limit or retention window, where catching that edit is the point), one whose subject is now the mock's behaviour rather than ours, one re-covering a branch another test covers. Fewer, wider tests beat many narrow ones: fold a near-duplicate into the test it shadows by widening that fixture. Removing a test a change made redundant is part of the change.

- **Never add production API for a test's benefit** — before building a completion signal, reset hook or inspection getter onto a primitive, grep for who else would call it; "only the test" means the signal almost certainly exists already (work through `getSynchronizedFunction` is drained by `waitForSynchronizedFunctions()`, so such a composable returns nothing). A test-only export means you are testing the wrong seam, or re-inventing a drain the repo owns.
- **Audit for transitive-only coverage** — after writing the suite, ask whether a branch is covered _only_ through a caller. Cover every branch of the contract, guard clauses included (the "skips non-directories" case, the no-op-when-absent case). Test a shared primitive **directly**; its wrappers cover only their unique value-add, as `references/test-helper-files.md` prescribes.
- **Test composables, not the service functions under them** — composable tests cover the full call chain; test a service directly only when it has no composable wrapper.
- **Don't test Zod schema constraints** (min/max, regex, required-field are Zod's concern) **or trivial lookups** — a function that just indexes a constant map with a static fallback would only restate the map; test functions with real logic (recursion, sorting, branching).
- **One test per operation** — all field assertions combined; don't split "updates name"/"updates bio".
- **A UI change earns a component test only when it is cheap under the default setup.** Mount it and assert the rendered structure when that works out of the box; when it would first need a store graph, the tRPC client or Vuetify internals mocked, write no test — the mocks become the subject, and the layout is the user's to eyeball (`run-app`, which also owns why an agent never checks one in a browser).
