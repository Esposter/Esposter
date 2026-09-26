# Colocated Mock Files

Read when a module is mocked in more than one suite, when writing a `vi.mock` factory, or when mocking `db` or a `Proxy` export.

## One double per module, beside it

When a service is mocked across multiple test files, create a colocated `*.test.ts` next to the service. Import via `vi.mock(import(...), () => import(...))` — **no `async` keyword** (`import()` already returns a Promise).

**Reach for the colocated mock file before hand-rolling a factory.** A hand-rolled inline factory duplicates a double that usually already exists, and every file that rolls its own drifts from the others. Inline factories are fine where no colocated file exists — plenty of suites use them — but type the function itself (`vi.fn<() => Promise<Foo>>()`), never a bare `vi.fn()`: an untyped `vi.fn()` is `any`-shaped, so it silently stops matching the module's declared signature when that signature changes.

**An inline factory reads its double through a `vi.hoisted` holder, never a plain `const`.** `vi.mock` is hoisted above file scope, so a factory closing over a file-scope binding throws a `ReferenceError` before the first test runs. Declare a mutable holder the factory reads and each test assigns, so the double stays per-test while the registration stays hoisted:

```ts
const { fooMock } = vi.hoisted(() => ({ fooMock: {} as { current: () => Promise<Bar> } }));

vi.mock(import("@/services/getFoo"), () => ({ getFoo: () => fooMock.current() }));
```

**A module whose export is a dynamic-path `Proxy` can only be mocked at the module seam.** `authClient`
(better-auth) resolves its methods through a `Proxy`, so `useSession` is not a configurable own property and
`vi.spyOn(authClient, "useSession")` throws rather than replacing anything. Its colocated
`app/services/auth/authClient.test.ts` is that seam: it exports the loosely typed `useSession`/`signOut` doubles
beside the cast `authClient`, so a suite registers `vi.mock(import("@/services/auth/authClient"), () =>
import("@/services/auth/authClient.test"))` and drives the method it imported from the mock file — never a
per-file factory that re-rolls the cast. A Proxy no colocated file covers yet gets one, on the same shape.

## Placement and export

Place mock files directly next to the service, same directory, `.test.ts` suffix (`src/services/getFoo.ts` → `src/services/getFoo.test.ts`).

**Export with the real name — never a `Mock` suffix** (e.g. `getFoo`, not `getFooMock`). This lets `vi.mock(import("real"), () => import("real.test"))` work and lets tests import from the real path to get the mock. Centralize all `as unknown as` casts in the mock file. Every mock-only `.test.ts` must end with `describe.todo("serviceName")` so Vitest accepts it without a real suite:

```ts
// src/services/getFoo.test.ts — export the real name, cast here, end with describe.todo
export const getFoo = <T extends BarType>(type: T): Promise<Bar<BarEntityMap[T]>> =>
  Promise.resolve(new MockBar<BarEntityMap[T]>("", type) as unknown as Bar<BarEntityMap[T]>);

describe.todo("getFoo");
```

**A module mocked through a colocated `*.test.ts` must be imported at module scope, never with `await import(...)` inside a test body.** The factory is evaluated at the mocked module's first import, so a first import from inside a test evaluates the mock file — and the `describe.todo` every such file carries — while a test is running, which Vitest rejects with `There was an error when mocking a module` / `Calling the suite function inside test function is not allowed`, naming the mock file rather than the import that triggered it. This is specific to the `() => import("real.test")` form: an inline factory registers no suite, so a lazy import of a module mocked that way is fine. Nothing is wrong with the registration itself either — a factory evaluated during collection, the normal case, registers no suite anywhere, so mocked modules cost their importers nothing.

## Usage in test files

```ts
vi.mock(import("@/services/getFoo"), () => import("@/services/getFoo.test"));
```

**A mock every suite wants is registered once in the package's vitest `setupFiles`, never per file.** A `vi.mock` is hoisted only within the file that writes it, so one written in a shared helper module (e.g. `context.test.ts`) does not intercept a test file's own direct import of the same module — the reason a registration tends to get copied verbatim into every suite that reads through it. A setup file runs before the test module is imported, so it covers both paths. In this repo every Azure composable and the better-auth session (`@@/server/auth` → `server/auth.test.ts`, whose `authMocks` the `context.test.ts` helpers drive) are registered in `apps/web/shared/test/setup.ts`; a test file adds its own `vi.mock` only for a double that is specific to it (an inline factory over local state). The session one is the cautionary case: registered from `context.test.ts` it reached a suite only while that module happened to load before the suite's router import, and a `setup*` fixture that took the `context.test.ts` import out of the suite file was what made the order visible.

When a test needs to call the mock directly (assert on calls / read mock state), import from the **real path** — Vitest intercepts it and returns the mock:

```ts
import { getFoo } from "@/services/getFoo";
const bar = await getFoo(BarType.Baz);
```

- Typed `vi.mock(import(...))` enforces type compatibility — casts stay in the mock file, never in individual tests.
- If `MockXxx` from `azure-mock` doesn't satisfy the Azure SDK type (private members), fix `azure-mock` first. Use `as unknown as` in the mock `.test.ts` only when SDK private members make structural compatibility impossible.
- **Never import a mocked export from the `.test` file in tests** — reach it through the real module path. Only a double the real module has no export for (a method of a Proxy, such as `useSession`) is imported from the mock file by name.

## `db` mock exception — getter pattern stays inline

The `db` mock cannot be centralized; it needs a getter so each test's `beforeAll`-initialized `mockDb` is lazily evaluated per-access:

```ts
// Must stay inline in each test file — not extractable to a shared mock file
let mockDb: Database;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));
```

`mockDb` must be at module level (not inside `describe`): `vi.mock` is hoisted to module scope; the getter closes over `mockDb` at the factory's lexical scope, so `let mockDb` inside `describe` would be out of scope.

## Where a helper module may not live

**Never add a non-`.d.ts` module under `apps/web/shared/` for test helpers.** `tsconfig.app.json` includes `../shared/**/*.d.ts` only, so a `.ts` helper there resolves for vitest but not for `vue-tsc` — and importing one from `shared/test/setup.ts` broke auto-import resolution across the whole app project (thousands of phantom `Cannot find name 'ref'` errors, nowhere near the file). Keep helpers colocated with their test, or beside the source they fake (`server/composables/azure/table/useTableClient.test.ts` exports the fake for `useTableClient`).
