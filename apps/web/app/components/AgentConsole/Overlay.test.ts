// @vitest-environment nuxt
import AgentConsoleOverlay from "@/components/AgentConsole/Overlay.vue";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(AgentConsoleOverlay, () => {
  const hostUrl = "ws://127.0.0.1:0/?token=hostUrl";
  const linkedHostUrl = "ws://127.0.0.1:0/?token=linkedHostUrl";

  // A link never re-pairs on its own, so a page already holding a host has to show the field the link filled, or the
  // Host the reader just started is unreachable from the console
  test.each([ConnectionStatus.Connected, ConnectionStatus.Disconnected])(
    "shows a pairing link's host to pair with while %s to another",
    async (status) => {
      expect.hasAssertions();

      const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
      agentConsoleConnectionStore.hostUrl = hostUrl;
      agentConsoleConnectionStore.linkedHostUrl = linkedHostUrl;
      agentConsoleConnectionStore.status = status;
      const agentConsolePanelStore = useAgentConsolePanelStore();
      agentConsolePanelStore.isConsoleOpen = true;
      const component = await mountSuspended(AgentConsoleOverlay, { attachTo: document.body });
      const input = document.querySelector("input");

      expect(input?.value).toBe(linkedHostUrl);

      component.unmount();
    },
  );
});
