---
name: testing
description: Apply when writing .test.ts or .test-d.ts files. Esposter Vitest testing conventions — suite structure, assertions, mocks, timers, running a narrow suite, and what earns a test at all; the values a test writes are the test-values skill's.
---

# Testing Conventions (Vitest)

## Settled — do not re-propose

- **A lint rule for constant scope** — an AST selector cannot ask the two whole-Program questions the exceptions turn on (a helper file, a binding read from a hoisted `vi.mock` factory or an awaited initialiser); `scripts/src/workspace/constantScope.test.ts` is the enforcer and asks both.

## Deep dives

Structure and helpers:

- `references/what-earns-a-test.md` — when deciding whether a subject earns a test at all, and which one.
- `references/test-placement.md` — when deciding which file a test goes in, or whether two checks over one directory are one suite.
- `references/suite-titles.md` — when a `describe`'s subject has no function reference, or its export is not camelCase.
- `references/module-scope.md` — when a test declares anything outside its `describe`, or `constantScope.test.ts` reports one.
- `references/case-tables.md` — when a test runs over a table of cases.
- `references/test-helper-files.md` — when a helper, fixture or hook block is shared between suites: one function per file, `constants.test.ts`, `setup*` fixtures.
- `references/wrapper-suites.md` — when two suites match modulo constants, or a suite tests a thin wrapper.
- `references/fixture-paths.md` — when a test creates, reads or names a real filesystem path.
- `references/type-tests.md` — when writing a `.test-d.ts`, or asserting a `void` return.
- `references/router-test-setup.md` — when writing a tRPC router test: callers, mock sessions, seeded rows, naming.

Assertions and waiting:

- `references/assertions.md` — when writing a test's `expect` calls: the matcher, how much of the value, a void return, a call's arguments.
- `references/error-assertions.md` — when filling in the inline snapshot a thrown or rejected error is asserted with.
- `references/polling.md` — when a test waits for something to happen.
- `references/timers-and-hand-resolved-promises.md` — when a test fakes timers, pins the clock, or holds a call in flight.
- `references/awaiting-a-double.md` — when a test proves a caller awaits its side effect, or orders two overlapping writes.

Doubles:

- `references/module-mocks.md` — when reaching for `vi.mock` or a spy: whether the behaviour needs a double, and which seam.
- `references/colocated-mocks.md` — when a module is mocked in several suites, writing a `vi.mock` factory, or mocking `db` or a `Proxy` export.
- `references/client-trpc-calls.md` — when code under test calls tRPC from the client: `setupMswTrpc`, never a mocked client.
- `references/mock-cleanup.md` — when choosing a mock's cleanup hook, queuing once-values, or stubbing a global or env var.
- `references/fabricated-ids.md` — when a mock returns a persisted entity, or a new foreign key turns a suite red.

Environment and running:

- `references/test-environment.md` — when a test needs a DOM or the nuxt runtime, or tests a composable with lifecycle hooks.
- `references/nuxt-environment-and-mounting.md` — when a test mounts a component: a routed link, a mount attached to the body, a dispatched event.
- `references/mounted-stores.md` — when a test seeds a store a mounted component reads, room-scoped stores included.
- `references/platform-and-bundle-tests.md` — when a suite is skipped on some hosts, or its output depends on the host.
- `references/bundle-size.md` — when a size snapshot fails or moves, or a new library package needs one.
- `references/running-the-suite.md` — when narrowing a run with `-t` or `-u`, or reading a failure only the full parallel run produces.

## Structure

- **`test` not `it`** — always `test(...)`.
- **A test lives beside what it tests** — `Foo.ts` → `Foo.test.ts`, never folded into a nearby suite or moved to the module it scans (`references/test-placement.md`).
- **`describe(functionRef, …)`**, flat — a string only when no reference exists, naming the file's export; `describe.each` over a matrix is not a group (`references/suite-titles.md`).
- **Nothing but imports, pure helpers and hoisted mocks lives at module scope** — every constant is a `const` inside the `describe` (`references/module-scope.md`).
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
- **CRITICAL — `toThrowErrorMatchingInlineSnapshot(...)` is the ONLY accepted error assertion**, sync and async (`vitest/no-restricted-matchers`); `not.toThrow()` is not an error assertion and stays, as how a best-effort function proves it swallows what it should (`references/error-assertions.md`).

## Mocking

- **Mock the smallest seam that makes the behaviour reachable**, never re-declare a mock another file owns, and drive real state before faking it (`references/module-mocks.md`).
- **The cleanup hook follows how the mock was created**, never habit — the wrong one leaks an implementation or a queued once-value into the next test (`references/mock-cleanup.md`).
- **`vi.fn()` always takes its signature** — `vi.fn<(input: CreateEmojiInput) => Promise<void>>()`, the production input and return types imported rather than restated. A bare `vi.fn()` infers `unknown` parameters, so destructuring a recorded call is an implicit-`any` lint error and `mockResolvedValue` accepts anything.

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
