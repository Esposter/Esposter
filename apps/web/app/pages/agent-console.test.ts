// @vitest-environment nuxt
import AgentConsolePage from "@/pages/agent-console.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { PAIRING_CODE_PARAMETER, PAIRING_HASH_PARAMETER } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe("agentConsolePage", () => {
  // A link is anyone's to craft, so one that paired on its own would send everything typed into the console to the
  // Host its author runs — it is offered, and the reader connects
  test("offers a link's host to connect to rather than pairing with it", async () => {
    expect.hasAssertions();

    const address = "ws://0.0.0.0";
    const code = crypto.randomUUID();
    window.history.replaceState(
      window.history.state,
      "",
      `#${new URLSearchParams({ [PAIRING_CODE_PARAMETER]: code, [PAIRING_HASH_PARAMETER]: address })}`,
    );
    await mountSuspended(AgentConsolePage, { shallow: true });
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();

    expect(agentConsoleConnectionStore.linkedHost).toStrictEqual({ address, code });
    expect(agentConsoleConnectionStore.pairedHost.credential).toBe("");
  });
});
