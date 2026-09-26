---
name: testing
description: Apply when writing .test.ts or .test-d.ts files. Esposter Vitest testing conventions — a test file colocated with what it tests, describe with function refs, constants scoped to the describe block, test.each over loops, vi.fn always typed, toStrictEqual, takeOne/assert.exists, call-count matchers, toThrowErrorMatchingInlineSnapshot as the only error assertion, the polling ban, never the full suite locally, and what earns a test at all (the values a test writes are the test-values skill's).
---

# Testing Conventions (Vitest)

## Settled — do not re-propose

- **A lint rule for constant scope** — an AST selector cannot ask the two whole-Program questions the exceptions turn on (a helper file, a binding read from a hoisted `vi.mock` factory or an awaited initialiser); `scripts/src/workspace/constantScope.test.ts` is the enforcer and asks both.

## Deep dives

- `references/router-test-setup.md` — tRPC callers, mock sessions, seeded mock-DB rows, naming a router test.
- `references/module-mocks.md` — what to mock; colocated doubles, `vi.mock` factories, the `db` getter, client tRPC calls, gating a double to prove a caller awaits it, and which cleanup hook the mock's creation style demands.
- `references/error-assertions.md` — filling in the inline snapshot a thrown or rejected error is asserted with.
- `references/what-earns-a-test.md` — deciding whether a given subject earns a test at all, and which one.
- `references/nuxt-environment-and-mounting.md` — a DOM, the nuxt runtime, a mounted component, a mount attached to the body, a plain mount's Pinia, a routed link, a dispatched event.
- `references/platform-and-bundle-tests.md` — skipping on some hosts, colorized CLI output, a built `dist` size.
- `references/suite-titles.md` — a `describe` whose subject has no function reference, or whose export is not camelCase.
- `references/test-helper-files.md` — anything that isn't a plain suite: what may live at module scope, shared helpers, `constants.test.ts` fixtures, filesystem path names, a wrapper suite delegating its matrix, `.test-d.ts`.
- `references/running-the-suite.md` — narrowing a run with `-t` or `-u`, reading a CI failure or timeout that only the full parallel run produces, and the Windows module allowlist.
- `references/timers-and-hand-resolved-promises.md` — fake timers, a pinned clock, throttled code, or a call held in flight.
- `references/test-placement.md` — when deciding which file a test goes in, or whether two checks over one directory are one suite.
- `references/case-tables.md` — when a test runs over a table of cases.
- `references/assertions.md` — when writing a test's `expect` calls: the matcher, how much of the value, a void return, a call's arguments.
- `references/polling.md` — when a test waits for something to happen.

## Structure

- **`test` not `it`** — always `test(...)`.
- **A test lives beside what it tests** — `Foo.ts` → `Foo.test.ts`, never folded into a nearby suite or moved to the module it scans (`references/test-placement.md`).
- **`describe(functionRef, …)`**, flat — a string only when no reference exists, naming the file's export; `describe.each` over a matrix is not a group (`references/suite-titles.md`).
- **Nothing but imports, pure helpers and hoisted mocks lives at module scope** — every constant is a `const` inside the `describe` (`references/test-helper-files.md`).
- **`test.each` for a table of cases, never a loop around `test`** (`vitest/prefer-each`), titled with `%s` (`references/case-tables.md`).
- **`expect.hasAssertions()`** — top of every test body.
- **Assertions after all assignments** — `expect` calls follow that phase's operations and locals, after a blank line.
- **A `void` return is never assigned or asserted at runtime** — `await fn();` bare, or `resolves.toBeUndefined()` (`references/assertions.md`).
- **Reuse utilities, and prefix factories `create*`** — look for an existing helper beside the code under test first; builders are `createRow`, never `make*`.

## Test data — the `test-values` skill

Every literal, id, date, path and fixture a test writes is that skill's: the canonical values, dates computed from the epoch, the three checks a string literal passes, and the shared-data shapes. This page assumes them.

## Assertions

- **`toStrictEqual` always**, exact counts, and `arrayContaining` never for an argv or an ordered sequence (`references/assertions.md`).
- **Never fragment-match a deterministic output** — the whole value with `.toBe(...)` or an inline snapshot, a runtime value the test holds interpolated in, never an element sampled from a knowable sequence (`references/assertions.md`).
- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`**, never the jest-extended once-with matcher (`references/assertions.md`).
- **`takeOne(arr, index)`** for `arr[index]` under `noUncheckedIndexedAccess` — not universal, prefer `find` when more idiomatic. **`assert.exists(value)`** narrows nullables and fails fast instead of `?? []`. Cloning: see the `typescript` skill.
- **No unnecessary destructure** — for plain objects, read a property directly when used once. Stores and composables keep the `pinia` skill's destructure ordering, unchanged in tests.
- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, async and sync alike, because it captures the exact message; `vitest/no-restricted-matchers` refuses `toThrow`, `toThrowError` and `toBeInstanceOf` in every chain. `not.toThrow()` is not an error assertion and stays — it is how a best-effort function proves it swallows what it should. Filling the snapshot in — reconstructing the message rather than pasting it, the opaque-third-party exception, and why a `test.each` row cannot carry one — is `references/error-assertions.md`.

## Mocking

- Mock the **smallest seam that makes the behaviour reachable**, never re-declare a mock another file owns, prefer driving real state to faking it — `references/module-mocks.md`, which also owns which cleanup hook a mock needs (it follows how the mock was created; call history is cleared before every test regardless, so the wrong one leaks an unrestored spy's implementation into the next test), why `mockReturnValueOnce` leaks a queued value into the next case, and the rules for `vi.stubGlobal`/`vi.stubEnv`.
- **`vi.fn()` always takes its signature**, with the production input and return types imported (`references/module-mocks.md`).

## Reactive Effects and Timers

- **A `watch` callback and a re-render run on Vue's scheduler, never synchronously** — `await nextTick()` flushes them after the write that queued them; `flushPromises()` from `@vue/test-utils` when the callback itself awaits. With nothing queued, neither is written.
- **Fake timers, and any promise the test resolves by hand, follow `references/timers-and-hand-resolved-promises.md`** — one `vi.useFakeTimers({ now: 0 })` in `beforeEach` with an unconditional restore in `afterEach`, `toFake` narrowed rather than widened, and `Promise.withResolvers` instead of a `let` closed over by an executor.
- **Polling is banned — CRITICAL, repo-wide** — await the real completion signal, never `expect.poll`, `vi.waitFor`, `vi.waitUntil` or a retry loop (`references/polling.md`).

## Running Tests

- **Every check runs in the background, once at the end** — the `running-checks` skill.
- **Never run the full suite locally** — `pnpm test <paths> --run` over what the change touched (`references/running-the-suite.md`).
- **`-t "name"` is not a scope, and `-u` gets the narrowest path list** — read the snapshot diff before committing (`references/running-the-suite.md`).

## What to Test

**Every test earns its line or it is deleted** — it earns it only by failing when behaviour a caller or user depends on breaks, and removing a test a change made redundant is part of the change (`references/what-earns-a-test.md`).

- **A test that asserts framework or filesystem wiring earns nothing** — a directory exists, a config key holds the value just set; the one pin worth keeping is a literal a tool cannot import and silently drops (`references/what-earns-a-test.md`).
- **Never add production API for a test's benefit** — a test-only export means the wrong seam, or a drain the repo already owns (`references/what-earns-a-test.md`).
- The recurring subjects where this has already been decided — a shared primitive versus its wrappers, a composable versus the service under it, Zod constraints, a `declare module` over third-party data, whether a UI change earns a mounted test — are `references/what-earns-a-test.md`.
