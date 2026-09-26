# Suites Over Thin Wrappers

Read when two suites are identical modulo constants, or a suite tests a wrapper over a function another suite already covers.

- **Twin test files → one behavior matrix + wiring tests** — when two suites are identical modulo constants (because their subjects are thin wrappers over a shared core), move the full behavior matrix to the shared core's test file; each wrapper test keeps only 1–2 wiring cases. **A wiring case earns its line only where the wrapper feeds the core something the core's own test cannot exercise** — a router's endpoint config, a schema the builder is instantiated with. A wrapper that merely _calls_ the primitive keeps none: the case then re-runs the matrix through a mount, and since it is never written for every consumer, the handful that have one only make the untested majority look deliberate.

- **A wrapper that extends one function's result mocks that function** and asserts its own delta over the fixed
  object the mock returns — `toStrictEqual({ ...extended, env: { ...extended.env, CI } })` — never calls through
  under the extended function's own mock set, which copies that suite's setup and ends up re-asserting its contract
  (`createOsInstallOptions.test.ts` over `createOsExecOptions`).

- **A wrapper's test states where the matrix lives** — a header comment naming the owning test file (`// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the MJML markup flavour`). Without it the next reader cannot tell a deliberately narrow suite from a thin one, and fills the gap with duplicates. The pointer also decays: a file carrying it while still asserting the delegated matrix is a duplicate to delete, not a comment to update.
