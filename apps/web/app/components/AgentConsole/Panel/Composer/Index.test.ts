// @vitest-environment nuxt
import AgentConsolePanelComposer from "@/components/AgentConsole/Panel/Composer/Index.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe(AgentConsolePanelComposer, () => {
  test("Enter that confirms an IME candidate leaves the composed text in the composer, unsent", async () => {
    expect.hasAssertions();

    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = crypto.randomUUID();
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const sendCommand = vi.spyOn(agentConsoleConnectionStore, "sendCommand");
    const component = await mountSuspended(AgentConsolePanelComposer);
    const prompt = component.get("textarea");
    await prompt.setValue("にほんご");
    prompt.element.dispatchEvent(new KeyboardEvent("keydown", { isComposing: true, key: "Enter" }));

    expect(sendCommand).not.toHaveBeenCalled();
    expect(prompt.element.value).toBe("にほんご");
  });

  test("a side chat's composer offers no mode to change", async () => {
    expect.hasAssertions();

    const agentConsoleSideChatStore = useAgentConsoleSideChatStore();
    agentConsoleSideChatStore.sideChatSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsolePanelComposer, { props: { isSideChat: true } });

    expect(component.findAllComponents({ name: "UiSelect" }).map((select) => select.props("label"))).toStrictEqual([
      "Model",
    ]);
  });

  test("the console's composer offers the mode to change", async () => {
    expect.hasAssertions();

    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsolePanelComposer);

    expect(component.findAllComponents({ name: "UiSelect" }).map((select) => select.props("label"))).toStrictEqual([
      "Model",
      "Mode",
    ]);
  });
});
