---
name: testing
description: Apply when writing .test.ts or .test-d.ts files. Esposter Vitest testing conventions — a test file colocated with what it tests, describe with function refs, constants scoped to the describe block, test.each over loops, vi.fn always typed, toStrictEqual, takeOne/assert.exists, call-count matchers, toThrowErrorMatchingInlineSnapshot as the only error assertion, the polling ban, never the full suite locally, and what earns a test at all (the values a test writes are the test-values skill's).
---

# Testing Conventions (Vitest)

## Deep dives

- `references/router-test-setup.md` — tRPC callers, mock sessions, seeded mock-DB rows, naming a router test.
- `references/module-mocks.md` — what to mock; colocated doubles, `vi.mock` factories, the `db` getter, client tRPC calls, gating a double to prove a caller awaits it, and which cleanup hook the mock's creation style demands.
- `references/error-assertions.md` — filling in the inline snapshot a thrown or rejected error is asserted with.
- `references/what-earns-a-test.md` — deciding whether a given subject earns a test at all, and which one.
- `references/nuxt-environment-and-mounting.md` — a DOM, the nuxt runtime, a mounted component, a routed link, a dispatched event.
- `references/platform-and-bundle-tests.md` — skipping on some hosts, colorized CLI output, a built `dist` size.
- `references/suite-titles.md` — a `describe` whose subject has no function reference, or whose export is not camelCase.
- `references/test-helper-files.md` — anything that isn't a plain suite: what may live at module scope, shared helpers, `constants.test.ts` fixtures, filesystem path names, a wrapper suite delegating its matrix, `.test-d.ts`.
- `references/running-the-suite.md` — narrowing a run with `-t` or `-u`, reading a CI failure or timeout that only the full parallel run produces, and the Windows module allowlist.
- `references/timers-and-hand-resolved-promises.md` — fake timers, a pinned clock, throttled code, or a call held in flight.

## Structure

- **`test` not `it`** — always `test(...)`.
- **A test lives beside what it tests.** `Foo.ts` → `Foo.test.ts` in the same folder — never folded into a larger nearby suite whose fixtures happen to be set up already, and never moved to whatever module the check happens to _scan_: a test that reads the whole repo still belongs beside the thing it proves something about. Two checks walking the same directory are two files when they prove different things — one that scans a tree tests the tree, one that asserts a map's contents tests the map. The cost of folding is that nobody opening `Foo.ts` can tell it is covered.
- **`describe(functionRef, …)`** — the function reference itself; a string only when no importable reference exists, and then it **names the file's export**, never the topic the test happens to cover, camelCased whole whatever the export's own casing (`vitest/prefer-lowercase-title` enforces it). What the test proves belongs in the test name; the block names what is under test. Flat — never a nested `describe` for sub-grouping. A default export, a suite with no subject file, a SCREAMING_SNAKE_CASE export, a constant whose value is a string: `references/suite-titles.md`.
- **Nothing but imports, pure helper functions and hoisted mocks lives at module scope.** Every constant — a literal, a fixture object, an entity built by a factory — is a `const` **inside the `describe` callback**. The reason is reachability, not memory: both are created during collection and freed at the same teardown, but a binding a sibling suite can reach is one a sibling suite can mutate, which is how a suite becomes order-dependent. What cannot move inward (the `vi.hoisted` block, what a `vi.mock` factory closes over), what "pure" means for a helper, and sibling `describe`s each declaring their own copy: `references/test-helper-files.md`.
- **`test.each` for a table of cases, never a loop around `test`** (`vitest/prefer-each`) — a loop registers every case under one name, so `pnpm test -t` cannot select one. The title takes `%s` rather than a template literal, which is what makes the row title match the case; a table of **enum members** needs `as const`, or the array widens to the enum and any discriminated union the case feeds rejects it. The one table that is a `for...of` inside a single test is a date-format matrix over every `DateFormat` — the formats are the subject, not the cases.
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — `expect` calls follow that phase's operations and locals, after a blank line.
- **A `void` return is never assigned or asserted at runtime** (`no-confusing-void-expression`, caught by the **root** `pnpm lint` alone since `apps/web`'s ESLint isn't type-aware; never disabled). A `Promise<void>`: `await fn();` bare when another assertion follows, else `await expect(fn()).resolves.toBeUndefined();`. One resolving to a **real value** goes into a `const`; a sync `void` contract is asserted in a `.test-d.ts` (`references/test-helper-files.md`).
- **Reuse utilities, and prefix factories `create*`** — look for an existing helper beside the code under test first; builders are `createRow`, never `make*`.

## Test data — the `test-values` skill

Every literal, id, date, path and fixture a test writes is that skill's: the canonical values, dates computed from the epoch, the three checks a string literal passes, and the shared-data shapes. This page assumes them.

## Assertions

- **`toStrictEqual` always** — never `toEqual`/`toMatchObject`, which pass while the fields you did not name drift; assert each field the test is about, or the whole value. **`toStrictEqual(expect.objectContaining(...))` is `toMatchObject` wearing a longer name** and goes the same way. `expect.arrayContaining` is the one with a real use — a genuine superset, where the extra elements are not the test's business — but never for an **argv or an ordered sequence**: it checks each element independently, so a run of flags passes it while scattered across the array and paired with the wrong values, which for an argv is the whole meaning. Snapshot the array instead; the snapshot then subsumes the `indexOf` ordering assertions written to shore the fragment up, and the comment saying why the order matters is what survives. Assert exact counts: no `.toBeGreaterThan(0)` on collections. The one carve-out is a **counter aggregated over machinery the test is not about** — a per-finder tally, a count of a stats object's own fields — where the exact number is that machinery's size and pinning it breaks on a change with nothing to do with the behaviour under test. There the assertion is that the counter moved, and it says so in a comment.
- **Never fragment-match a deterministic output** — assert the whole value with `.toBe(fullValue)`, inlined in the `expect` call rather than an intermediate `const expected*`; `toMatchInlineSnapshot()` (empty, filled with `pnpm test -u`) when it is bulky or multiline. A full snapshot **subsumes** paired negative assertions, so drop the `.not.toContain(...)`. `.toContain`/`.toMatch` survive only for genuine membership on non-deterministic content (a runtime UUID or temp path); output embedding a machine-specific path isn't snapshot-safe — fragment-match or assert behaviour portably.
- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`**, also with no args. **the jest-extended once-with matcher is BANNED** — Vitest does not ship it, so it fails typecheck. Where it doesn't fit: `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.
- **`takeOne(arr, index)`** for `arr[index]` under `noUncheckedIndexedAccess` — not universal, prefer `find` when more idiomatic. **`assert.exists(value)`** narrows nullables and fails fast instead of `?? []`. Cloning: see the `typescript` skill.
- **No unnecessary destructure** — for plain objects, read a property directly when used once. Stores and composables keep the `pinia` skill's destructure ordering, unchanged in tests.
- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, async (`.rejects.`) and sync (`expect(() => fn())`) alike: it captures the exact message. **BANNED**: `toThrow()`, `toThrow(arg)`, `.rejects.toThrow(...)`, `toThrowError(...)`, `toBeInstanceOf(...)`, hand-rolled `try { fn(); expect.fail() } catch`. Filling the snapshot in — reconstructing the message rather than pasting it, the opaque-third-party exception, and why a `test.each` row cannot carry one — is `references/error-assertions.md`.

## Mocking

- Mock the **smallest seam that makes the behaviour reachable**, never re-declare a mock another file owns, prefer driving real state to faking it — `references/module-mocks.md`, which also owns which cleanup hook a mock needs (it follows how the mock was created, and the wrong one leaks call history into the next test) and the rules for `vi.stubGlobal`/`vi.stubEnv`.
- **`vi.fn()` always takes its signature** — `vi.fn<(input: CreateEmojiInput) => Promise<void>>()`. A bare `vi.fn()` infers `unknown` parameters, so destructuring a recorded call (`mock.calls.map(([{ id }]) => id)`) is an implicit-`any` lint error and `mockResolvedValue` accepts anything. Write the real signature, importing the production input/return types rather than restating their fields.

## Reactive Effects and Timers

- **No `nextTick`** — no DOM, sync effects fire immediately; use `flushPromises()` from `@vue/test-utils` for async watch callbacks.
- **Fake timers, and any promise the test resolves by hand, follow `references/timers-and-hand-resolved-promises.md`** — one `vi.useFakeTimers({ now: 0 })` in `beforeEach` with an unconditional restore in `afterEach`, `toFake` narrowed rather than widened, and `Promise.withResolvers` instead of a `let` closed over by an executor.
- **Polling is banned — CRITICAL, repo-wide** (`expect.poll`, `vi.waitFor`, `vi.waitUntil`, retry-until loops; all but the loops lint-enforced via `no-restricted-properties`). Await the real completion signal: promises, `flushPromises()`, emitted events, or `waitForSynchronizedFunctions()` for fire-and-forget work through `getSynchronizedFunction`. Standard: `apps/web/content/docs/architecture/no-polling.md`. To prove a caller awaits its own side effect, gate a double and drain one boundary — under fake timers that boundary is `await vi.advanceTimersByTimeAsync(0)`, never a bare `setTimeout` promise nor the sync `vi.advanceTimersByTime` (`references/module-mocks.md`).

## Running Tests

- **Always use `run_in_background: true`** for `pnpm lint`, `pnpm typecheck`, and test commands.
- **Never run the full suite locally** — `pnpm test <paths> -u --run` with the paths the change touched. CI is the regression net and shards it across runners; a local run answers one question about one change. The scope is what the diff touched: the files changed, their direct consumers, and any suite whose snapshots the change moves — when unsure whether a distant suite is affected, name it in the same invocation rather than widening to everything, since a second path argument costs seconds and the full sweep costs the session. Full-run-only failures and the Windows module allowlist are `references/running-the-suite.md`.
- **`-t "name"` is not a scope — pass paths as well**, and **`-u` gets the narrowest path list that can produce the diff**, with `git diff` on the updated snapshots read before committing. Why each flag misbehaves on its own: `references/running-the-suite.md`.

## What to Test

**Every test earns its line or it is deleted** — it earns it only by failing when behaviour a caller or user depends on breaks. Delete on sight, new and existing alike: one asserting a constant's literal value or restating a map/schema (it fails only on a deliberate edit and the diff is the review — unless the literal is fixed outside this repo: a wire/protocol value, security limit or retention window, where catching that edit is the point), one whose subject is now the mock's behaviour rather than ours, one re-covering a branch another test covers. Fewer, wider tests beat many narrow ones: fold a near-duplicate into the test it shadows by widening that fixture. Removing a test a change made redundant is part of the change.

- **A test that asserts framework or filesystem wiring earns nothing** — a directory exists, a config key holds the value just set; the one pin worth keeping is a literal a tool cannot import and silently drops (`references/what-earns-a-test.md`).
- **Never add production API for a test's benefit** — before building a completion signal, reset hook or inspection getter onto a primitive, grep for who else would call it; "only the test" means the signal almost certainly exists already. A test-only export means you are testing the wrong seam, or re-inventing a drain the repo owns.
- The recurring subjects where this has already been decided — a shared primitive versus its wrappers, a composable versus the service under it, Zod constraints, a `declare module` over third-party data, whether a UI change earns a mounted test — are `references/what-earns-a-test.md`.
