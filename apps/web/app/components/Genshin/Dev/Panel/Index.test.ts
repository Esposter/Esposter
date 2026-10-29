// @vitest-environment happy-dom
import GenshinDevPanel from "@/components/Genshin/Dev/Panel/Index.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createDevRegistry, DevVariableKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe("genshinDevPanel", () => {
  test("Control and console agree", async () => {
    expect.hasAssertions();

    const state = { isFogShown: false };
    const registry = createDevRegistry();
    registry.register({
      commands: [],
      variables: [
        {
          get: () => state.isFogShown,
          group: "Look/Fog",
          kind: DevVariableKind.Boolean,
          name: "fog shown",
          set: (value) => {
            state.isFogShown = value === true;
          },
        },
      ],
    });
    const component = mount(GenshinDevPanel, { props: { modelValue: true, registry } });

    await component.get('[role="switch"]').trigger("click");
    await flushPromises();

    expect(state.isFogShown).toBe(true);
  });
});
