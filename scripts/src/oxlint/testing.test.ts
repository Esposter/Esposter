import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("testing", () => {
  const FAKE_TIMERS = "vi.useFakeTimers";
  const SET_TIMEOUT = "setTimeout";
  const TO_FAKE = "toFake";
  const DB_MOCK_IMPORT = `import { createMockDb } from "@esposter/db-mock";\nawait createMockDb();`;
  const CONTEXT_IMPORT = `import { createMockContext } from "#server/trpc/context.test";\nawait createMockContext();`;
  // Each fixture is read by the rule, and the ones its imports do not trigger report nothing
  const FIXTURES = [
    { name: "miniflareDefaultSet", source: `${DB_MOCK_IMPORT}\n${FAKE_TIMERS}();`, violations: 1 },
    { name: "miniflareNowOnly", source: `${CONTEXT_IMPORT}\n${FAKE_TIMERS}({ now: 0 });`, violations: 1 },
    {
      name: "miniflareNamesSetTimeout",
      source: `${DB_MOCK_IMPORT}\n${FAKE_TIMERS}({ ${TO_FAKE}: ["Date", "${SET_TIMEOUT}"] });`,
      violations: 1,
    },
    {
      name: "miniflareClocksOnly",
      source: `${CONTEXT_IMPORT}\n${FAKE_TIMERS}({ now: 0, ${TO_FAKE}: ["Date", "Temporal"] });`,
      violations: 0,
    },
    // A suite doing no real I/O fakes what it likes
    { name: "withoutRealIo", source: `${FAKE_TIMERS}();`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "testing", rules: ["testing/fake-clock-only"] });
});

describe("testing/require-suite", () => {
  const FIXTURES = [
    { name: "helperOnlyReports", source: `export const helper = 0;`, violations: 1 },
    { name: "describeTodoPasses", source: `describe.todo("helper");`, violations: 0 },
    { name: "eachCallPasses", source: `test.each([1])("reads %d", () => {});`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "testing", rules: ["testing/require-suite"] });
});
