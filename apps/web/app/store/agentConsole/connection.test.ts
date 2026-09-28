// @vitest-environment nuxt
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { takeOne } from "@esposter/shared";
import { ServerMessageType, SessionState } from "agent-console-server/contracts";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

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

  // A host stopped from its own window says so first, and the page waits to be asked rather than retrying forever
  test("shows a host that said it was stopping as stopped, with its sessions closed, and does not retry it", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const sockets: EventTarget[] = [];
    vi.stubGlobal(
      "WebSocket",
      class extends EventTarget {
        close = vi.fn<() => void>();
        constructor() {
          super();
          sockets.push(this);
        }
      },
    );
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const { status } = storeToRefs(agentConsoleConnectionStore);
    const { pair } = agentConsoleConnectionStore;
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { sessions } = storeToRefs(agentConsoleSessionStore);
    const sessionId = crypto.randomUUID();
    sessions.value = [{ cwd: "", id: sessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" }];
    pair("ws://a");
    const socket = takeOne(sockets);
    socket.dispatchEvent(new Event("open"));
    socket.dispatchEvent(
      new MessageEvent("message", { data: JSON.stringify({ type: ServerMessageType.HostStopping }) }),
    );
    socket.dispatchEvent(new Event("close"));
    vi.runAllTimers();

    expect(status.value).toBe(ConnectionStatus.Stopped);
    expect(sessions.value.map(({ state }) => state)).toStrictEqual([SessionState.Closed]);
    expect(sockets).toHaveLength(1);

    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
