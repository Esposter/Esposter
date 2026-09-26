// @vitest-environment nuxt
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { SessionState } from "agent-console-server/contracts";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useAgentConsoleConnectionStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("refuses a pasted address that is not a WebSocket URL instead of retrying it forever", () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const { hostUrl, status } = storeToRefs(agentConsoleConnectionStore);
    const { pair } = agentConsoleConnectionStore;
    pair("a");

    expect(status.value).toBe(ConnectionStatus.Unpaired);
    expect(hostUrl.value).toBe("");
  });

  test("unpairs to a page with nothing of the host left open", () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const { unpair } = agentConsoleConnectionStore;
    const agentConsolePanelStore = useAgentConsolePanelStore();
    const { isConsoleOpen, isPauseMenuOpen } = storeToRefs(agentConsolePanelStore);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
    const sessionId = crypto.randomUUID();
    sessions.value = [{ cwd: "", id: sessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" }];
    currentSessionId.value = sessionId;
    isConsoleOpen.value = true;
    isPauseMenuOpen.value = true;
    unpair();

    expect(sessions.value).toHaveLength(0);
    expect(currentSessionId.value).toBe("");
    expect(isConsoleOpen.value).toBe(false);
    expect(isPauseMenuOpen.value).toBe(false);
  });
});
