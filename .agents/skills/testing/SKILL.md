---
name: testing
description: Esposter Vitest testing conventions — a test file colocated with what it tests, describe with function refs, constants scoped to the describe block rather than module scope, test.each over loops, canonical test values, the shared-test-data DRY rule, always typing vi.fn, toStrictEqual, takeOne/assert.exists, no unnecessary destructure, call-count matchers, toThrowErrorMatchingInlineSnapshot as the only error assertion, the polling ban, the ban on running the full suite locally, and what earns a test at all — plus deep dives on router tests, what to mock plus mock cleanup and global/env stubs, the nuxt environment, platform/CLI/bundle snapshots, full-run failures, helper/`.test-d.ts` files, fake timers with hand-resolved promises, error-snapshot reconstruction, fixture shapes, and which subjects earn a test. Apply when writing .test.ts or .test-d.ts files.
---

# Testing Conventions (Vitest)

## Deep dives

- `references/router-test-setup.md` — tRPC callers, mock sessions, seeded mock-DB rows, naming a router test.
- `references/module-mocks.md` — what to mock; colocated doubles, `vi.mock` factories, the `db` getter, client tRPC calls, gating a double to prove a caller awaits it, and which cleanup hook the mock's creation style demands.
- `references/error-assertions.md` — filling in the inline snapshot a thrown or rejected error is asserted with.
- `references/what-earns-a-test.md` — deciding whether a given subject earns a test at all, and which one.
- `references/shared-test-data.md` — a value two tests need, an envelope built per case, or a literal production already owns.
- `references/nuxt-environment-and-mounting.md` — a DOM, the nuxt runtime, a mounted component, a routed link, a dispatched event.
- `references/platform-and-bundle-tests.md` — skipping on some hosts, colorized CLI output, a built `dist` size.
- `references/test-helper-files.md` — anything that isn't a plain suite: shared helpers, `constants.test.ts` fixtures, filesystem path names, a wrapper suite delegating its matrix, `.test-d.ts`.
- `references/running-the-suite.md` — reading a CI failure or timeout that only the full parallel run produces, and the Windows module allowlist.
- `references/timers-and-hand-resolved-promises.md` — fake timers, a pinned clock, throttled code, or a call held in flight.

## Structure

- **`test` not `it`** — always `test(...)`.
- **A test lives beside what it tests.** `Foo.ts` → `Foo.test.ts` in the same folder — never folded into a larger nearby suite whose fixtures happen to be set up already, and never moved to whatever module the check happens to _scan_: a test that reads the whole repo still belongs beside the thing it proves something about. Two checks walking the same directory are two files when they prove different things — one that scans a tree tests the tree, one that asserts a map's contents tests the map. The cost of folding is that nobody opening `Foo.ts` can tell it is covered.
- **`describe(functionRef, …)`** — the function reference itself; a string only when no importable reference exists, and then it **names the file's export**, never the topic the test happens to cover (`describe("drizzleAdapterConfiguration")`, not `describe("better-auth joins")`). What the test proves belongs in the test name; the block names what is under test. Flat — never a nested `describe` for sub-grouping.
- **Nothing but imports, pure helper functions and hoisted mocks lives at module scope.** Every constant — a literal, a fixture object, an entity built by a factory — is a `const` **inside the `describe` callback**. The reason is reachability, not memory: both are created during collection and freed at the same teardown, but a binding a sibling suite can reach is one a sibling suite can mutate, which is how a suite becomes order-dependent. The exceptions are what _cannot_ move inward — the `vi.hoisted` block, which `vi.mock` lifts above the imports, and **anything a `vi.mock` factory closes over** (the `let mockDb` a `get db()` factory returns). A helper that captures a suite constant is not the pure kind and moves in with it; a constant shared by sibling `describe`s is declared in each, because duplicating two lines beats a file-scope binding every block can reach. `describe.each` is the one case where the scoping is also a lifetime — its callback runs per case. State rebuilt per test is a `let` in the same place, initialized in `beforeEach` (`references/shared-test-data.md`).
- **`test.each` for a table of cases, never a loop around `test`** (`no-restricted-syntax`) — a loop registers every case under one name, so `pnpm test -t` cannot select one. The title takes `%s` rather than a template literal, which is what makes the row title match the case; a table of **enum members** needs `as const`, or the array widens to the enum and any discriminated union the case feeds rejects it.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — `expect` calls follow that phase's operations and locals, after a blank line.
- **A `void` return is never assigned or asserted at runtime** (`no-confusing-void-expression`, caught by the **root** `pnpm lint` alone since `packages/app`'s ESLint isn't type-aware; never disabled). A `Promise<void>`: `await fn();` bare when another assertion follows, else `await expect(fn()).resolves.toBeUndefined();`. One resolving to a **real value** goes into a `const`; a sync `void` contract is asserted in a `.test-d.ts` (`references/test-helper-files.md`).
- **Reuse utilities, and prefix factories `create*`** — look for an existing helper beside the code under test first; builders are `createRow`, never `make*`.

## Shared Test Data (DRY)

- **Never repeat a literal or object**: anything used by 2+ tests (or 2+ rows of a bulk insert) is declared **once** at `describe` scope and referenced. Hard rule — but no single-use extraction; a value used once stays inline.
- **Never re-declare what production owns — import it.** A sentinel, cmdline marker, temp-file prefix, cache filename, env-var key or sizing formula the source owns is imported from there, or the copy stays green while asserting the wrong thing after the source changes.
- The shapes that take (base + spread, `create*` envelopes, bulk `.map`), which values stay `let`, and how to export a module-private constant for a test: `references/shared-test-data.md`.

## Canonical Test Values

- Boolean `"true"`/`"false"` (both in one case), integer `"0"`/`0`, decimal `"0.1"`/`0.1`, negative `"-1"`/`-1`, NaN `String(Number.NaN)`, dates `"1970-01-01"` then `"1970-01-02"`.
- Strings: `""` base, `" "` for a different value, `"a"` only when a space trims to `""`. Object keys likewise — never semantic names.
- Nonexistent ID `"-1"` (string) / `-1` (number) — never `"non-existent-id"`. Real IDs are `crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Other entity fields use the field name as the literal: `const name = "name"`. Filesystem names are the canonical `TEST_FILENAME = "a"` / `TEST_DIR = "/a"` (`references/test-helper-files.md`).
- **Every string literal passes one of three checks or it does not go in**: the value under test, a canonical value above, or an existing `describe`-scope constant/helper in that file. Anything else is decoration the code never inspects — a filename is `"a"`, not `"logo.png"`, with a realistic word only where behaviour reads it (mimetype inference, a parser, trigram ranking). **Prose fails all three**: an invented body, note or title reads as text a human would type, but the code only matches a substring or stores a blob. Reuse the file's message helper for a valid body, and hoist a token with its body: ``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``
- **Freeze the clock instead of asserting `toBeInstanceOf(Date)`** — `vi.useFakeTimers({ now: 0 })` plus `expect(row.createdAt).toStrictEqual(new Date(0))`; the instance check only restates the schema's column type and passes against a value written a day late. Works under PGlite/`createMockDb` and the Azure mocks.
- **Date format tests** — `for...of` inside one test over `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never `test.each`.
- **Descriptions interpolate enum values** — `` `${FooType.Bar}: <plain-English outcome>` ``, never the literal; plain English otherwise ("integer", "epoch date"). Idempotency is always `"[functionName] is idempotent"`, never `"deduplicates …"`/`"does not create duplicate"`/`"skips duplicate"`.

## Assertions

- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`. Assert exact counts: no `.toBeGreaterThan(0)` on collections.
- **Never fragment-match a deterministic output** — assert the whole value with `.toBe(fullValue)`, inlined in the `expect` call rather than an intermediate `const expected*`; `toMatchInlineSnapshot()` (empty, filled with `pnpm test -u`) when it is bulky or multiline. A full snapshot **subsumes** paired negative assertions, so drop the `.not.toContain(...)`. `.toContain`/`.toMatch` survive only for genuine membership on non-deterministic content (a runtime UUID or temp path); output embedding a machine-specific path isn't snapshot-safe — fragment-match or assert behaviour portably.
- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`**, also with no args. **`toHaveBeenCalledOnceWith` is BANNED** — jest-extended, absent from Vitest 4, fails typecheck. Where it doesn't fit: `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.
- **`takeOne(arr, index)`** for `arr[index]` under `noUncheckedIndexedAccess` — not universal, prefer `find` when more idiomatic. **`assert.exists(value)`** narrows nullables and fails fast instead of `?? []`. Cloning: see the `typescript` skill.
- **No unnecessary destructure** — for plain objects, read a property directly when used once. Stores and composables keep the `pinia` skill's destructure ordering, unchanged in tests.
- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, async (`.rejects.`) and sync (`expect(() => fn())`) alike: it captures the exact message. **BANNED**: `toThrow()`, `toThrow(arg)`, `.rejects.toThrow(...)`, `toThrowError(...)`, `toBeInstanceOf(...)`, hand-rolled `try { fn(); expect.fail() } catch`. Filling the snapshot in — reconstructing the message rather than pasting it, the opaque-third-party exception, and why a `test.each` row cannot carry one — is `references/error-assertions.md`.

## Mocking

- Mock the **smallest seam that makes the behaviour reachable**, never re-declare a mock another file owns, prefer driving real state to faking it — `references/module-mocks.md`, which also owns which cleanup hook a mock needs (it follows how the mock was created, and the wrong one leaks call history into the next test) and the rules for `vi.stubGlobal`/`vi.stubEnv`.
- **`vi.fn()` always takes its signature** — `vi.fn<(input: CreateEmojiInput) => Promise<void>>()`. A bare `vi.fn()` infers `unknown` parameters, so destructuring a recorded call (`mock.calls.map(([{ id }]) => id)`) is an implicit-`any` lint error and `mockResolvedValue` accepts anything. Write the real signature, importing the production input/return types rather than restating their fields.

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately; use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers, and any promise the test resolves by hand, follow `references/timers-and-hand-resolved-promises.md`** — one `vi.useFakeTimers({ now: 0 })` in `beforeEach` with an unconditional restore in `afterEach`, `toFake` narrowed rather than widened, and `Promise.withResolvers` instead of a `let` closed over by an executor.
- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, retry-until loops; the first two lint-enforced via `no-restricted-syntax`). Await the real completion signal: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Standard: `packages/app/content/docs/architecture/no-polling.md`. To prove a caller awaits its own side effect, gate a double and drain one boundary — under fake timers that boundary is `await vi.advanceTimersByTimeAsync(0)`, never a bare `setTimeout` promise nor the sync `vi.advanceTimersByTime` (`references/module-mocks.md`).

## Running Tests

- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.
- **Never run the full suite locally** — `pnpm test <paths> -u --run` with the paths the change touched. The scoping rule is the `package-scripts` skill's; full-run-only failures and the Windows module allowlist are `references/running-the-suite.md`.

## What to Test

**Every test earns its line or it is deleted** — it earns it only by failing when behaviour a caller or user depends on breaks. Delete on sight, new and existing alike: one asserting a constant's literal value or restating a map/schema (it fails only on a deliberate edit and the diff is the review — unless the literal is fixed outside this repo: a wire/protocol value, security limit or retention window, where catching that edit is the point), one whose subject is now the mock's behaviour rather than ours, one re-covering a branch another test covers. Fewer, wider tests beat many narrow ones: fold a near-duplicate into the test it shadows by widening that fixture. Removing a test a change made redundant is part of the change.

- **A test that asserts framework or filesystem wiring earns nothing.** A directory exists, a config key holds the value the config file just set, a third-party loader was handed the right glob — none of these fail on a change anyone would ship, and the ones over generated output (a build directory, a typedoc dump) fail on a fresh clone instead. What is worth pinning is a literal a tool **cannot** import and therefore silently drops: a JSON config's ignore list, or a config evaluated during `postinstall`, which runs before any workspace package is built and so cannot resolve one. Not a path the suite beside it would already fail on. Ask what a reviewer would have merged for this test to fire; if the answer is "nothing", it is maintenance with no return.
- **Never add production API for a test's benefit** — before building a completion signal, reset hook or inspection getter onto a primitive, grep for who else would call it; "only the test" means the signal almost certainly exists already. A test-only export means you are testing the wrong seam, or re-inventing a drain the repo owns.
- The recurring subjects where this has already been decided — a shared primitive versus its wrappers, a composable versus the service under it, Zod constraints, a `declare module` over third-party data, whether a UI change earns a mounted test — are `references/what-earns-a-test.md`.
