// @vitest-environment nuxt
import AgentConsolePage from "@/pages/agent-console.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { PAIRING_HASH_PARAMETER } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe("agentConsolePage", () => {
  // A link is anyone's to craft, so one that paired on its own would send everything typed into the console to the
  // Host its author runs — it fills the form, and the reader pairs
  test("fills the pairing form from a link rather than pairing", async () => {
    expect.hasAssertions();

    const hostUrl = "ws://0.0.0.0";
    window.history.replaceState(window.history.state, "", `#${PAIRING_HASH_PARAMETER}=${hostUrl}`);
    await mountSuspended(AgentConsolePage, { shallow: true });
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();

    expect(agentConsoleConnectionStore.linkedHostUrl).toBe(hostUrl);
    expect(agentConsoleConnectionStore.hostUrl).toBe("");
  });
});
