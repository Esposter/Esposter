import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("testing", () => {
  const RULE = "testing/no-faked-batch-timer";
  const IMPORT = `import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";\nsetupMswTrpc();`;
  const FIXTURES = [
    { name: "defaultSet", source: `${IMPORT}\nvi.useFakeTimers();`, violations: 1 },
    { name: "nowOnly", source: `${IMPORT}\nvi.useFakeTimers({ now: 0 });`, violations: 1 },
    { name: "namesSetTimeout", source: `${IMPORT}\nvi.useFakeTimers({ toFake: ["setTimeout"] });`, violations: 1 },
    { name: "namesOthers", source: `${IMPORT}\nvi.useFakeTimers({ toFake: ["Date", "setInterval"] });`, violations: 0 },
    // A suite that answers no tRPC call fakes what it likes
    { name: "withoutMswTrpc", source: "vi.useFakeTimers();", violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "testing", rules: [RULE] });
});
