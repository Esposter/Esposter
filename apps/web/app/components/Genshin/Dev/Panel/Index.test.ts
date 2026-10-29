// @vitest-environment happy-dom
import GenshinDevPanel from "@/components/Genshin/Dev/Panel/Index.vue";
import { GENSHIN_DEV_SCENARIOS_TAB, GENSHIN_DEV_STATS_GROUP } from "@/services/genshin/dev/constants";
import { noop, takeOne } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createDevRegistry, DevVariableKind } from "genshin-world";
import { beforeEach, describe, expect, test } from "vitest";

describe("genshinDevPanel", () => {
  // The panel keeps its open tab in local storage, so a tab one test opens must not be the next test's first tab
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("Scenarios and stats are in the panel", async () => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    registry.register({
      commands: [],
      scenarios: [{ lines: ["stat on"], name: "Stats overlay" }],
      variables: [
        { get: () => false, group: GENSHIN_DEV_STATS_GROUP, kind: DevVariableKind.Boolean, name: "stat", set: noop },
      ],
    });
    const component = mount(GenshinDevPanel, { props: { modelValue: true, registry } });

    expect(component.findAll('[role="tab"]').map((tab) => tab.text())).toStrictEqual([
      "Stats",
      GENSHIN_DEV_SCENARIOS_TAB,
    ]);
    expect(component.get('[role="switch"]').attributes("aria-label")).toBe("stat");

    await takeOne(component.findAll('[role="tab"]'), 1).trigger("click");

    expect(component.findAll("button").map((button) => button.text())).toContain("Stats overlay");
  });

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
