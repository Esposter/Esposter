// @vitest-environment nuxt
import AgentConsoleSheet from "@/components/AgentConsole/Sheet.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { AgentEventType, CommandType, SessionState } from "agent-console-server/contracts";
import { afterEach, describe, expect, test, vi } from "vitest";

const pairConsole = () => {
  const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
  agentConsoleConnectionStore.connections = [
    { address: "wss://a", credential: crypto.randomUUID(), id: crypto.randomUUID(), publicKey: " " },
  ];
  const agentConsolePanelStore = useAgentConsolePanelStore();
  agentConsolePanelStore.isConsoleOpen = true;
  return vi.spyOn(agentConsoleConnectionStore, "sendCommand");
};
const runSession = (sessionId: string) => {
  const agentConsoleSessionStore = useAgentConsoleSessionStore();
  agentConsoleSessionStore.storeEvents(sessionId, [
    { createdAt: new Date(0), id: crypto.randomUUID(), state: SessionState.Running, type: AgentEventType.SessionState },
  ]);
};

describe(AgentConsoleSheet, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("the chord opens the side chat", async () => {
    expect.hasAssertions();

    pairConsole();
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsoleSheet);
    // The mount wraps the sheet, so the chord is pressed on the sheet itself, where the reader's focus is
    await component.get('[aria-label="Console"]').trigger("keydown", { ctrlKey: true, key: ";" });

    const agentConsoleSideChatStore = useAgentConsoleSideChatStore();
    expect(agentConsoleSideChatStore.isSideChatOpen).toBe(true);
    expect(component.findAll('textarea[aria-label="Message Claude"]')).toHaveLength(1);
    expect(component.findAll('textarea[aria-label="Ask the side chat"]')).toHaveLength(1);
  });

  test("the chord backgrounds the console's session while the console's turn runs", async () => {
    expect.hasAssertions();

    const sendCommand = pairConsole();
    const sessionId = crypto.randomUUID();
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = sessionId;
    runSession(sessionId);
    const component = await mountSuspended(AgentConsoleSheet);
    await component.get('textarea[aria-label="Message Claude"]').trigger("keydown", { ctrlKey: true, key: "b" });

    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({ sessionId, type: CommandType.BackgroundTasks });
  });

  test("the chord backgrounds the side chat's session while the side chat's turn runs, and leaves the console's", async () => {
    expect.hasAssertions();

    const sendCommand = pairConsole();
    const sessionId = crypto.randomUUID();
    const sideChatSessionId = crypto.randomUUID();
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = sessionId;
    const agentConsoleSideChatStore = useAgentConsoleSideChatStore();
    agentConsoleSideChatStore.isSideChatOpen = true;
    agentConsoleSideChatStore.sideChatSessionId = sideChatSessionId;
    runSession(sideChatSessionId);
    const component = await mountSuspended(AgentConsoleSheet);
    await component.get('textarea[aria-label="Ask the side chat"]').trigger("keydown", { ctrlKey: true, key: "b" });

    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({
      sessionId: sideChatSessionId,
      type: CommandType.BackgroundTasks,
    });
  });
});
