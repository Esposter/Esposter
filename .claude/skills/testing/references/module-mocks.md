# Module Mocks (`vi.mock`, colocated doubles, msw-trpc)

How a module-level double is declared, where it lives, and which registration form to use.

## Colocated mock files

When a service is mocked across multiple test files, create a colocated `*.test.ts` next to the service. Import via `vi.mock(import(...), () => import(...))` — **no `async` keyword** (`import()` already returns a Promise).

**Reach for the colocated mock file before hand-rolling a factory.** A hand-rolled inline factory duplicates a double that usually already exists, and every file that rolls its own drifts from the others. Inline factories are fine where no colocated file exists — plenty of suites use them — but type the function itself (`vi.fn<() => Promise<Foo>>()`), never a bare `vi.fn()`: an untyped `vi.fn()` is `any`-shaped, so it silently stops matching the module's declared signature when that signature changes.

**An inline factory reads its double through a `vi.hoisted` holder, never a plain `const`.** `vi.mock` is hoisted above file scope, so a factory closing over a file-scope binding throws a `ReferenceError` before the first test runs. Declare a mutable holder the factory reads and each test assigns, so the double stays per-test while the registration stays hoisted:

```ts
const { fooMock } = vi.hoisted(() => ({ fooMock: {} as { current: () => Promise<Bar> } }));

vi.mock(import("@/services/getFoo"), () => ({ getFoo: () => fooMock.current() }));
```

### Placement and export

Place mock files directly next to the service, same directory, `.test.ts` suffix (`src/services/getTableClient.ts` → `src/services/getTableClient.test.ts`).

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

**A module mocked through a colocated `*.test.ts` must be imported at module scope, never with `await import(...)` inside a test body.** The factory is evaluated at the mocked module's first import, so a first import from inside a test evaluates the mock file — and the `describe.todo` every such file carries — while a test is running, which Vitest rejects with `There was an error when mocking a module` / `Calling the suite function inside test function is not allowed`, naming the mock file rather than the import that triggered it. This is specific to the `() => import("real.test")` form: an inline factory registers no suite, so a lazy import of a module mocked that way is fine. Nothing is wrong with the registration itself either — a factory evaluated during collection, the normal case, registers no suite anywhere, so mocked modules cost their importers nothing.

### Usage in test files

```ts
vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));
```

**A mock every suite wants is registered once in the package's vitest `setupFiles`, never per file.** A `vi.mock` is hoisted only within the file that writes it, so one written in a shared helper module (e.g. `context.test.ts`) does not intercept a test file's own direct import of the same module — the reason a registration tends to get copied verbatim into every suite that reads through it. A setup file runs before the test module is imported, so it covers both paths. In this repo every Azure composable is registered in `packages/app/shared/test/setup.ts`; a test file adds its own `vi.mock` only for a double that is specific to it (an inline factory over local state).

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

## Client-side tRPC calls are answered at the network

Call `setupMswTrpc()` at `describe` scope (`@/services/trpc/mswTrpc.test`) and declare per-test handlers on the server it returns: `server.use(trpcMsw.message.createMessage.mutation(({ input }) => …))`. Handlers are typed off `TRPCRouter`, so a renamed or re-shaped procedure fails to compile instead of silently answering a call that no longer exists — the thing a hand-written client stub cannot do. The real plugin, links and transformer all run. **Never `vi.mock` `trpc-nuxt/client`.**

- The handler receives `{ input }` and its assertion sees that whole object: `expect(handler).toHaveBeenCalledWith({ input: { … } })`.
- Two transport settings differ under test, both via `IS_TEST` in `app/plugins/trpc.ts`: the client uses `@trpc/client`'s `httpLink` (trpc-nuxt's wraps Nuxt's `$fetch`, which resolves internally and never reaches an interceptor) against an absolute url (node's fetch rejects a bare path), and batching is off (a batched call puts several procedures behind one url that no per-procedure handler can match). Neither changes anything a test asserts on.
- Unhandled requests pass through rather than failing, so a test declares only the calls it is about.

## Where a helper module may not live

**Never add a non-`.d.ts` module under `packages/app/shared/` for test helpers.** `tsconfig.app.json` includes `../shared/**/*.d.ts` only, so a `.ts` helper there resolves for vitest but not for `vue-tsc` — and importing one from `shared/test/setup.ts` broke auto-import resolution across the whole app project (thousands of phantom `Cannot find name 'ref'` errors, nowhere near the file). Keep helpers colocated with their test, or beside the source they fake (`server/composables/**/useX.test.ts` exports the fake for `useX`).

## `InvocationContext` logHandler

Always a plain no-op: `new InvocationContext({ logHandler: () => {} })`. A bare `vi.fn()` does typecheck here — it is `any`-shaped, so it satisfies the `LogHandler` contract without ever being checked against it — but nothing asserts on the logs, so the spy buys nothing. Reach for `vi.fn<LogHandler>()` only when a test actually asserts what was logged.
