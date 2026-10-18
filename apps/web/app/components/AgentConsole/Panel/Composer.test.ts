// @vitest-environment nuxt
import AgentConsolePanelComposer from "@/components/AgentConsole/Panel/Composer.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(AgentConsolePanelComposer, () => {
  test("A side chat's composer offers no mode to change", async () => {
    expect.hasAssertions();

    useAgentConsoleSessionStore().currentSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsolePanelComposer, { props: { isSideChat: true } });

    expect(component.findAllComponents(UiSelect).map((select) => select.props("label"))).toStrictEqual(["Model"]);
  });

  test("The console's composer offers the mode to change", async () => {
    expect.hasAssertions();

    useAgentConsoleSessionStore().currentSessionId = crypto.randomUUID();
    const component = await mountSuspended(AgentConsolePanelComposer);

    expect(component.findAllComponents(UiSelect).map((select) => select.props("label"))).toStrictEqual([
      "Model",
      "Mode",
    ]);
  });
});
