# Module Mocks (`vi.mock`, colocated doubles, msw-trpc)

What deserves a double at all, how a module-level one is declared, where it lives, which registration form to use, and which cleanup hook it then needs.

## What to mock

Mock the **smallest seam that makes the behaviour under test reachable**, and never re-declare a mock another file already owns.

- **Prefer driving state over mocking a getter** — a store's derived state usually has a real input to set (set the route param the store derives its state from). `vi.spyOn(store, "prop", "get")` breaks `storeToRefs`, which reads the underlying ref rather than the spied accessor.
- **Mock a module only for what the environment genuinely cannot do** — a canvas downscale, a network PUT, a clock. If a fake is only saving setup lines, build the real input instead.

## Gating a double to prove a caller awaits it

An ordering contract ("the caller does not return until its side effect is durable") is untestable by observing the side effect afterwards — every assertion that reads it `await`s something first, handing the fire-and-forget chain the turns it needed, so the test passes against the bug. Make the dependency block instead: stub the client so the write returns a promise the test resolves by hand, start the call without awaiting it, drain past one timer boundary (`await new Promise((resolve) => { setTimeout(resolve); })`), and assert the caller has **not** settled; then release and await it. A single one-shot boundary flushes every pending microtask and re-checks nothing, so it is not polling. Verify the test fails against the un-awaited version before keeping it.

## Two overlapping writes: hold the rejection until the success has settled

A test proving a rollback restores only its own row needs the failing write to unwind against a list the
successful one has **already** shortened. Issued together, the rejection can land first and roll back against a
list nothing has shortened yet — which passes against the whole-list rollback the test exists to rule out. Gate
the failing handler on a promise the successful one resolves, so the order is the test's rather than the
scheduler's.

**Under fake timers that boundary is `await vi.advanceTimersByTimeAsync(0)`, never a bare `setTimeout` promise** — the clock is frozen, so the `setTimeout` above never fires and the test hangs to its timeout instead of failing on the contract. The sync `vi.advanceTimersByTime` is no substitute either: it fires the timer without ever yielding, so the continuations behind it have not run when the assertion reads, and the awaiting caller looks exactly like the un-awaiting one again. Microtask drains (`flushPromises()`, `waitForSynchronizedFunctions()`) are unaffected — Vitest fakes timers and `Date`, not the microtask queue.

## Colocated mock files

When a service is mocked across multiple test files, create a colocated `*.test.ts` next to the service. Import via `vi.mock(import(...), () => import(...))` — **no `async` keyword** (`import()` already returns a Promise).

**Reach for the colocated mock file before hand-rolling a factory.** A hand-rolled inline factory duplicates a double that usually already exists, and every file that rolls its own drifts from the others. Inline factories are fine where no colocated file exists — plenty of suites use them — but type the function itself (`vi.fn<() => Promise<Foo>>()`), never a bare `vi.fn()`: an untyped `vi.fn()` is `any`-shaped, so it silently stops matching the module's declared signature when that signature changes.

**An inline factory reads its double through a `vi.hoisted` holder, never a plain `const`.** `vi.mock` is hoisted above file scope, so a factory closing over a file-scope binding throws a `ReferenceError` before the first test runs. Declare a mutable holder the factory reads and each test assigns, so the double stays per-test while the registration stays hoisted:

```ts
const { fooMock } = vi.hoisted(() => ({ fooMock: {} as { current: () => Promise<Bar> } }));

vi.mock(import("@/services/getFoo"), () => ({ getFoo: () => fooMock.current() }));
```

**A module whose export is a dynamic-path `Proxy` can only be mocked at the module seam.** `authClient`
(better-auth) resolves its methods through a `Proxy`, so `useSession` is not a configurable own property and
`vi.spyOn(authClient, "useSession")` throws rather than replacing anything. Mock the module and drive the method
through a hoisted holder, as above.

### Placement and export

Place mock files directly next to the service, same directory, `.test.ts` suffix (`src/services/getFoo.ts` → `src/services/getFoo.test.ts`).

**Export with the real name — never a `Mock` suffix** (e.g. `getFoo`, not `getFooMock`). This lets `vi.mock(import("real"), () => import("real.test"))` work and lets tests import from the real path to get the mock. Centralize all `as unknown as` casts in the mock file. Every mock-only `.test.ts` must end with `describe.todo("serviceName")` so Vitest accepts it without a real suite:

```ts
// src/services/getFoo.test.ts — export the real name, cast here, end with describe.todo
export const getFoo = <T extends BarType>(type: T): Promise<Bar<BarEntityMap[T]>> =>
  Promise.resolve(new MockBar<BarEntityMap[T]>("", type) as unknown as Bar<BarEntityMap[T]>);

describe.todo("getFoo");
```

**A module mocked through a colocated `*.test.ts` must be imported at module scope, never with `await import(...)` inside a test body.** The factory is evaluated at the mocked module's first import, so a first import from inside a test evaluates the mock file — and the `describe.todo` every such file carries — while a test is running, which Vitest rejects with `There was an error when mocking a module` / `Calling the suite function inside test function is not allowed`, naming the mock file rather than the import that triggered it. This is specific to the `() => import("real.test")` form: an inline factory registers no suite, so a lazy import of a module mocked that way is fine. Nothing is wrong with the registration itself either — a factory evaluated during collection, the normal case, registers no suite anywhere, so mocked modules cost their importers nothing.

### Usage in test files

```ts
vi.mock(import("@/services/getFoo"), () => import("@/services/getFoo.test"));
```

**A mock every suite wants is registered once in the package's vitest `setupFiles`, never per file.** A `vi.mock` is hoisted only within the file that writes it, so one written in a shared helper module (e.g. `context.test.ts`) does not intercept a test file's own direct import of the same module — the reason a registration tends to get copied verbatim into every suite that reads through it. A setup file runs before the test module is imported, so it covers both paths. In this repo every Azure composable is registered in `packages/app/shared/test/setup.ts`; a test file adds its own `vi.mock` only for a double that is specific to it (an inline factory over local state).

When a test needs to call the mock directly (assert on calls / read mock state), import from the **real path** — Vitest intercepts it and returns the mock:

```ts
import { getFoo } from "@/services/getFoo";
const bar = await getFoo(BarType.Baz);
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

## Client-side tRPC calls are answered at the network

Call `setupMswTrpc()` at `describe` scope (`@/services/trpc/mswTrpc.test`) and declare per-test handlers on the server it returns: `server.use(trpcMsw.foo.createFoo.mutation(({ input }) => …))`. Handlers are typed off `TRPCRouter`, so a renamed or re-shaped procedure fails to compile instead of silently answering a call that no longer exists — the thing a hand-written client stub cannot do. The real plugin, links and transformer all run. **Never `vi.mock` `trpc-nuxt/client`.**

- The handler receives `{ input }` and its assertion sees that whole object: `expect(handler).toHaveBeenCalledWith({ input: { … } })`.
- Two transport settings differ under test, both via `IS_TEST` in `app/plugins/trpc.ts`: the client uses `@trpc/client`'s `httpLink` (trpc-nuxt's wraps Nuxt's `$fetch`, which resolves internally and never reaches an interceptor) against an absolute url (node's fetch rejects a bare path), and batching is off (a batched call puts several procedures behind one url that no per-procedure handler can match). Neither changes anything a test asserts on.
- Unhandled requests pass through rather than failing, so a test declares only the calls it is about.

## Where a helper module may not live

**Never add a non-`.d.ts` module under `packages/app/shared/` for test helpers.** `tsconfig.app.json` includes `../shared/**/*.d.ts` only, so a `.ts` helper there resolves for vitest but not for `vue-tsc` — and importing one from `shared/test/setup.ts` broke auto-import resolution across the whole app project (thousands of phantom `Cannot find name 'ref'` errors, nowhere near the file). Keep helpers colocated with their test, or beside the source they fake (`server/composables/**/useX.test.ts` exports the fake for `useX`).

## `InvocationContext` logHandler

Always a plain no-op: `new InvocationContext({ logHandler: () => {} })`. A bare `vi.fn()` does typecheck here — it is `any`-shaped, so it satisfies the `LogHandler` contract without ever being checked against it — but nothing asserts on the logs, so the spy buys nothing. Reach for `vi.fn<LogHandler>()` only when a test actually asserts what was logged.

## Cleanup follows how the mock was created

Getting this wrong is invisible until a call-count assertion reads a neighbour's calls, so the hook is chosen by creation style, never by habit.

- **`vi.spyOn()` → `vi.restoreAllMocks()`** (default) — restores the original implementation AND clears recorded calls, so spies never leak.
- **Module-level `vi.fn()` (colocated `vi.mock`) → `vi.clearAllMocks()`** — never a spy, so `restoreAllMocks` lets its call history **leak into the next test**. Required wherever `toHaveBeenCalled*` is asserted on one across tests; a file mixing both kinds needs both calls.
- **Never `vi.resetAllMocks()` as routine cleanup** — it resets implementations to empty functions, erasing intentional `vi.mock` defaults.

## Globals and environment variables

- **Globals use `vi.stubGlobal`**, never `Object.defineProperty`; unstub with `vi.unstubAllGlobals()` in `afterEach` (per-test stubs) or `afterAll` (set once in `beforeAll`). `vi.restoreAllMocks()` does **not** undo a `stubGlobal`.
- **`vi.stubEnv` needs no teardown** — `unstubEnvs: true` in `getVitestConfiguration` restores the env after every test, so never write an `unstubAllEnvs` hook. `vi.stubEnv(KEY, undefined)` is how a test unsets one, which is what a case reading a default owes itself: an ambient `CI` or opt-out from the dev's shell otherwise decides the answer. The globals flag stays off deliberately: it would restore a `beforeAll` `stubGlobal` after the file's first test.
- **An env var a `beforeAll` sets is the one case `vi.stubEnv` cannot serve**, and for the same reason: the restore runs after every test, so the second test onwards would see the host value. A suite-scoped override reads the previous value, assigns `process.env` directly, and puts it back in `afterAll` — the hand-rolled shape everywhere else is a finding.
- **A test must never read a color/TTY env var it did not stub.** `checkIsColorEnabled` consults `NO_COLOR`/`FORCE_COLOR`, so an ambient one from the dev's shell repaints CLI output; virrun's `vitest.config.ts` pins both empty for the package, and a test wanting color stubs `FORCE_COLOR` itself.

## A double that fabricates an entity id owes it a row

A mock standing in for something that returns a persisted entity — a session, a user, anything an id names —
must write the row as well as the object, whenever the suite has a database. A double that invents an id nothing
stored is a lie the suite cannot see: every read passes, and the **first foreign key added over that id turns
every write path red at once**, a package away from the mock that caused it.

When that happens, the constraint is the thing that is right. Fix the double, not the schema: an id that names
another table's row earns a foreign key, and tests fighting one are reporting their own fixture. Dropping the
constraint to make them pass buys a green suite and keeps the impossible state representable.

Two properties to preserve while making such a double truthful, because both are load-bearing elsewhere:

- **Freshness, where a suite drives one request per device.** Memoising the fabricated entity makes every
  "other device" the current one, and the tests that relied on per-call identity fail somewhere unrelated.
  Insert per call instead — if the real function is `async` and its callers await it, the mock can be too.
- **The harness's own writes must outlive a test's spies.** A suite stubbing `db.insert` to make application
  code fail will otherwise break the bookkeeping as collateral. Bind the real method once, when the database is
  created, and use that reference.
