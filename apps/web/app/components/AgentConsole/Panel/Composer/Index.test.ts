// @vitest-environment nuxt
import AgentConsolePanelComposer from "@/components/AgentConsole/Panel/Composer/Index.vue";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { useAlertStore } from "@/store/alert";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ATTACHMENTS_MAX_BYTE_LENGTH } from "agent-console-server/contracts";
import { describe, expect, test, vi } from "vitest";

describe(AgentConsolePanelComposer, () => {
  const name = "name";

  test("enter that confirms an IME candidate leaves the composed text in the composer, unsent", async () => {
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

  test("a file too large by its size is named as left out, and is not read", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const file = new File(["a"], name);
    // A file that large, with its bytes left out, as its size reports it
    Object.defineProperty(file, "size", { value: ATTACHMENTS_MAX_BYTE_LENGTH * 2 + 1 });
    const arrayBuffer = vi.spyOn(file, "arrayBuffer");
    const component = await mountSuspended(AgentConsolePanelComposer);
    await component.get("textarea").trigger("drop", { dataTransfer: { files: [file] } });
    await flushPromises();

    expect(alertStore.alerts.map(({ text }) => text)).toStrictEqual([expect.stringContaining(`"${name}"`)]);
    expect(arrayBuffer).not.toHaveBeenCalled();
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
