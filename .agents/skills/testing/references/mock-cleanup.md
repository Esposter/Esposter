# Mock Cleanup, Globals and Environment Variables

Read when choosing a cleanup hook for a mock, queuing once-values, or stubbing a global or an environment variable.

## Cleanup follows how the mock was created

Vitest clears call history before every test on its own, so what a wrong hook leaks is never a call: it is an implementation — a spy left unrestored keeps its fake in every later test of the file — or a queued once-value. Neither shows until a neighbour reads it, so the hook is chosen by creation style, never by habit.

- **`vi.spyOn()` → `vi.restoreAllMocks()`** (default) — restores the original implementation, which the automatic history clear does not, so a spy's fake never outlives its test.
- **Module-level `vi.fn()` (colocated `vi.mock`) → nothing** — Vitest clears mock history before every test by default, so a module-level `vi.fn()` never leaks its calls into the next one. An explicit `vi.clearAllMocks()` is only worth writing where a test clears **mid-test**, between two call-count assertions of its own; in a `beforeEach` it restates the default.
- **Never `vi.resetAllMocks()` as routine cleanup** — it resets implementations to empty functions, erasing intentional `vi.mock` defaults.
- **`mockReturnValueOnce` leaks between tests** — the automatic `clearMocks` clears calls, not the queue of once-values, so a case that short-circuits before reading its mock leaves that value for the next case, which then reads it instead of its own and fails somewhere else. Use `mockReturnValue` in a `test.each` whose cases set every input, and keep `mockReturnValueOnce` for a single test asserting a sequence of calls.

## Globals and environment variables

- **Globals use `vi.stubGlobal`**, never `Object.defineProperty`; unstub with `vi.unstubAllGlobals()` in `afterEach` (per-test stubs) or `afterAll` (set once in `beforeAll`). `vi.restoreAllMocks()` does **not** undo a `stubGlobal`.
- **`vi.stubEnv` needs no teardown** — `unstubEnvs: true` in `getVitestConfiguration` restores the env before every test, so never write an `unstubAllEnvs` hook. `vi.stubEnv(KEY, undefined)` is how a test unsets one, which is what a case reading a default owes itself: an ambient `CI` or opt-out from the dev's shell otherwise decides the answer. The globals flag stays off deliberately: it would restore a `beforeAll` `stubGlobal` before the file's first test.
- **An env var a `beforeAll` sets is the one case `vi.stubEnv` cannot serve**, and for the same reason: the restore runs before every test, so even the first test would see the host value. A suite-scoped override reads the previous value, assigns `process.env` directly, and puts it back in `afterAll` — `setupSuiteEnv` (`packages/virrun/src/services/exec/test/setupSuiteEnv.test.ts`) is that shape, registered before the `beforeAll` that reads the value, and a hand-rolled copy of it is a finding.
- **A test must never read a color/TTY env var it did not stub.** `checkIsColorEnabled` consults `NO_COLOR`/`FORCE_COLOR`, so an ambient one from the dev's shell repaints CLI output; virrun's `vitest.config.ts` pins both empty for the package, and a test wanting color stubs `FORCE_COLOR` itself.
