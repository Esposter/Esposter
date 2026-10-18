// @vitest-environment nuxt
import AgentConsolePanelMessageActions from "@/components/AgentConsole/Panel/MessageActions.vue";
import UiMenu from "@/components/Ui/Menu/Index.vue";
import { MessageActionType } from "@/models/agentConsole/MessageActionType";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CommandType } from "agent-console-server/contracts";
import { describe, expect, test, vi } from "vitest";

describe(AgentConsolePanelMessageActions, () => {
  const sessionId = crypto.randomUUID();
  const messageUuid = crypto.randomUUID();

  test("Fork on a side chat's message forks it as a side chat", async () => {
    expect.hasAssertions();

    useAgentConsoleSessionStore().currentSessionId = sessionId;
    const sendCommand = vi.spyOn(useAgentConsoleConnectionStore(), "sendCommand");
    const component = await mountSuspended(AgentConsolePanelMessageActions, {
      props: { isSideChat: true, messageUuid, text: "reply" },
    });
    component.findComponent(UiMenu).vm.$emit("select", MessageActionType.Fork);

    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({
      isSideChat: true,
      messageUuid,
      sessionId,
      type: CommandType.Fork,
    });
  });

  test("Fork on a console message forks it as a session of its own", async () => {
    expect.hasAssertions();

    useAgentConsoleSessionStore().currentSessionId = sessionId;
    const sendCommand = vi.spyOn(useAgentConsoleConnectionStore(), "sendCommand");
    const component = await mountSuspended(AgentConsolePanelMessageActions, { props: { messageUuid, text: "reply" } });
    component.findComponent(UiMenu).vm.$emit("select", MessageActionType.Fork);

    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({
      isSideChat: false,
      messageUuid,
      sessionId,
      type: CommandType.Fork,
    });
  });
});
