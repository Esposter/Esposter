import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("testing", () => {
  const FAKE_TIMERS = "vi.useFakeTimers";
  const SET_TIMEOUT = "setTimeout";
  const TO_FAKE = "toFake";
  const MSW_TRPC_IMPORT = `import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";\nsetupMswTrpc();`;
  const DB_MOCK_IMPORT = `import { createMockDb } from "@esposter/db-mock";\nawait createMockDb();`;
  const CONTEXT_IMPORT = `import { createMockContext } from "#server/trpc/context.test";\nawait createMockContext();`;
  // Each fixture is read by both rules, and the one its imports do not trigger reports nothing
  const FIXTURES = [
    { name: "mswDefaultSet", source: `${MSW_TRPC_IMPORT}\n${FAKE_TIMERS}();`, violations: 1 },
    { name: "mswNowOnly", source: `${MSW_TRPC_IMPORT}\n${FAKE_TIMERS}({ now: 0 });`, violations: 1 },
    {
      name: "mswNamesSetTimeout",
      source: `${MSW_TRPC_IMPORT}\n${FAKE_TIMERS}({ ${TO_FAKE}: ["${SET_TIMEOUT}"] });`,
      violations: 1,
    },
    {
      name: "mswNamesOthers",
      source: `${MSW_TRPC_IMPORT}\n${FAKE_TIMERS}({ ${TO_FAKE}: ["Date", "setInterval"] });`,
      violations: 0,
    },
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
  setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "testing",
    rules: ["testing/fake-clock-only", "testing/no-faked-set-timeout"],
  });
});
