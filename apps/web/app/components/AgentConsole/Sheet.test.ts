// @vitest-environment nuxt
import AgentConsoleSheet from "@/components/AgentConsole/Sheet.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { AgentEventType, CommandType, SessionState } from "agent-console-server/contracts";
import { describe, expect, test, vi } from "vitest";

describe(AgentConsoleSheet, () => {
  const pairConsole = () => {
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    agentConsoleConnectionStore.connections = [
      {
        address: "wss://a",
        credential: crypto.randomUUID(),
        deviceId: crypto.randomUUID(),
        id: crypto.randomUUID(),
        publicKey: " ",
      },
    ];
    useAgentConsolePanelStore().isConsoleOpen = true;
    return vi.spyOn(agentConsoleConnectionStore, "sendCommand");
  };
  const runSession = (sessionId: string) =>
    useAgentConsoleSessionStore().storeEvents(sessionId, [
      {
        createdAt: new Date(),
        id: crypto.randomUUID(),
        state: SessionState.Running,
        type: AgentEventType.SessionState,
      },
    ]);

  test("The chord opens the side chat", async () => {
    expect.hasAssertions();

    pairConsole();
    useAgentConsoleSessionStore().currentSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsoleSheet);
    // The mount wraps the sheet, so the chord is pressed on the sheet itself, where the reader's focus is
    await component.get('[aria-label="Console"]').trigger("keydown", { ctrlKey: true, key: ";" });

    expect(useAgentConsoleSideChatStore().isSideChatOpen).toBe(true);
    expect(component.findAll('textarea[aria-label="Message Claude"]')).toHaveLength(1);
    expect(component.findAll('textarea[aria-label="Ask the side chat"]')).toHaveLength(1);
  });

  test("The chord backgrounds the console's session while the console's turn runs", async () => {
    expect.hasAssertions();

    const sendCommand = pairConsole();
    const sessionId = crypto.randomUUID();
    useAgentConsoleSessionStore().currentSessionId = sessionId;
    runSession(sessionId);
    const component = await mountSuspended(AgentConsoleSheet);
    await component.get('textarea[aria-label="Message Claude"]').trigger("keydown", { ctrlKey: true, key: "b" });

    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({ sessionId, type: CommandType.BackgroundTasks });
  });

  test("The chord backgrounds the side chat's session while the side chat's turn runs, and leaves the console's", async () => {
    expect.hasAssertions();

    const sendCommand = pairConsole();
    const sessionId = crypto.randomUUID();
    const sideChatSessionId = crypto.randomUUID();
    useAgentConsoleSessionStore().currentSessionId = sessionId;
    useAgentConsoleSideChatStore().isSideChatOpen = true;
    useAgentConsoleSideChatStore().sideChatSessionId = sideChatSessionId;
    runSession(sideChatSessionId);
    const component = await mountSuspended(AgentConsoleSheet);
    await component.get('textarea[aria-label="Ask the side chat"]').trigger("keydown", { ctrlKey: true, key: "b" });

    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({
      sessionId: sideChatSessionId,
      type: CommandType.BackgroundTasks,
    });
  });
});
