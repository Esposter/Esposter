// @vitest-environment nuxt
import AgentConsolePanelComposer from "@/components/AgentConsole/Panel/Composer.vue";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(AgentConsolePanelComposer, () => {
  test("a side chat's composer offers no mode to change", async () => {
    expect.hasAssertions();

    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    agentConsoleSessionStore.currentSessionId = crypto.randomUUID();
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
