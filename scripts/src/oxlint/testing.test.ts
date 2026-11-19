import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("testing", () => {
  const FAKE_TIMERS = "vi.useFakeTimers";
  const SET_TIMEOUT = "setTimeout";
  const TO_FAKE = "toFake";

  describe("no-faked-set-timeout", () => {
    const IMPORT = `import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";\nsetupMswTrpc();`;
    const FIXTURES = [
      { name: "defaultSet", source: `${IMPORT}\n${FAKE_TIMERS}();`, violations: 1 },
      { name: "nowOnly", source: `${IMPORT}\n${FAKE_TIMERS}({ now: 0 });`, violations: 1 },
      {
        name: "namesSetTimeout",
        source: `${IMPORT}\n${FAKE_TIMERS}({ ${TO_FAKE}: ["${SET_TIMEOUT}"] });`,
        violations: 1,
      },
      {
        name: "namesOthers",
        source: `${IMPORT}\n${FAKE_TIMERS}({ ${TO_FAKE}: ["Date", "setInterval"] });`,
        violations: 0,
      },
      // A suite that answers no tRPC call fakes what it likes
      { name: "withoutMswTrpc", source: `${FAKE_TIMERS}();`, violations: 0 },
    ];
    setupPluginSuite({ fixtures: FIXTURES, plugin: "testing", rules: ["testing/no-faked-set-timeout"] });
  });

  describe("fake-clock-only", () => {
    const DB_MOCK_IMPORT = `import { createMockDb } from "@esposter/db-mock";\nawait createMockDb();`;
    const CONTEXT_IMPORT = `import { createMockContext } from "#server/trpc/context.test";\nawait createMockContext();`;
    const FIXTURES = [
      { name: "defaultSet", source: `${DB_MOCK_IMPORT}\n${FAKE_TIMERS}();`, violations: 1 },
      { name: "nowOnly", source: `${CONTEXT_IMPORT}\n${FAKE_TIMERS}({ now: 0 });`, violations: 1 },
      {
        name: "namesSetTimeout",
        source: `${DB_MOCK_IMPORT}\n${FAKE_TIMERS}({ ${TO_FAKE}: ["Date", "${SET_TIMEOUT}"] });`,
        violations: 1,
      },
      {
        name: "clocksOnly",
        source: `${CONTEXT_IMPORT}\n${FAKE_TIMERS}({ now: 0, ${TO_FAKE}: ["Date", "Temporal"] });`,
        violations: 0,
      },
      // A suite on no Miniflare fakes what it likes
      { name: "withoutMiniflare", source: `${FAKE_TIMERS}();`, violations: 0 },
    ];
    setupPluginSuite({ fixtures: FIXTURES, plugin: "testing", rules: ["testing/fake-clock-only"] });
  });
});
