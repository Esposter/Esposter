// @vitest-environment nuxt
import AgentConsoleWorkPermission from "@/components/AgentConsole/Work/Permission.vue";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { AgentEventType, CommandType, PermissionBehavior } from "agent-console-server/contracts";
import { assert, describe, expect, test, vi } from "vitest";

describe("agentConsoleWorkPermission", () => {
  const sessionId = crypto.randomUUID();

  test("shows the recorded Write as the diff it would make and answers with the verdict clicked", async () => {
    expect.hasAssertions();

    const permissionRequest = readRecordedEvents().find((event) => event.type === AgentEventType.PermissionRequest);
    assert.exists(permissionRequest);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
    currentSessionId.value = sessionId;
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const sendCommand = vi.spyOn(agentConsoleConnectionStore, "sendCommand").mockImplementation(() => {});
    const component = await mountSuspended(AgentConsoleWorkPermission, { props: { permissionRequest } });
    const allowButton = component.findAll("button").find((button) => button.text() === "Allow");
    assert.exists(allowButton);
    await allowButton.trigger("click");

    expect(component.find(".v-card-title").text()).toBe(`${permissionRequest.toolName} wants permission`);
    expect(component.find("[font-mono]").text()).toBe("/a");
    expect(sendCommand).toHaveBeenCalledExactlyOnceWith({
      behavior: PermissionBehavior.Allow,
      message: "",
      requestId: permissionRequest.requestId,
      sessionId,
      type: CommandType.PermissionVerdict,
    });
  });
});
