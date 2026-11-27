export const FAKE_CLOCK_ONLY_MESSAGE =
  'A suite on Miniflare fakes the clock and nothing else — `toFake: ["Date"]`: its bindings reach workerd through Node\'s own timers, and with those faked every D1 call stalls, which cost such a suite seconds a test';
// The clocks a test reads, as against the timers that schedule work
export const FAKEABLE_CLOCKS: string[] = ["Date", "Temporal"];
export const MINIFLARE_MODULE = "@esposter/db-mock";
// The app's mock context, which every server suite on the database takes its Miniflare through
export const MINIFLARE_MODULE_SUFFIX = "/trpc/context.test";
export const REQUIRE_SUITE_MESSAGE =
  "A test file declares a suite: a helper-only `.test.ts` ends with `describe.todo` naming its file, so Vitest reads it as a suite with no tests. See the testing skill's test-helper-files page";
// The calls that declare a suite or a test, bare or with a modifier such as `test.each` or `describe.todo`
export const SUITE_CALLEES: string[] = ["describe", "it", "test"];
