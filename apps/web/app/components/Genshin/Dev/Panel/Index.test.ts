// @vitest-environment happy-dom
import type { DevVariable } from "genshin-world";

import GenshinDevPanel from "@/components/Genshin/Dev/Panel/Index.vue";
import { GENSHIN_DEV_SCENARIOS_TAB, GENSHIN_DEV_STATS_GROUP } from "@/services/genshin/dev/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { noop, takeOne } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createDevRegistry, DevVariableKind } from "genshin-world";
import { beforeEach, describe, expect, test } from "vitest";

const createFogVariable = (state: { isFogShown: boolean }): DevVariable => ({
  get: () => state.isFogShown,
  group: "Look/Fog",
  kind: DevVariableKind.Boolean,
  name: "fog shown",
  set: (value) => {
    state.isFogShown = value === true;
  },
});

describe("genshinDevPanel", () => {
  // The panel keeps its open tab in local storage, so a tab one test opens must not be the next test's first tab
  beforeEach(() => {
    localStorage.clear();
  });

  test("scenarios and stats are in the panel", async () => {
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

  test("control and console agree", async () => {
    expect.hasAssertions();

    const state = { isFogShown: false };
    const registry = createDevRegistry();
    registry.register({ commands: [], variables: [createFogVariable(state)] });
    const component = mount(GenshinDevPanel, { props: { modelValue: true, registry } });

    await component.get('[role="switch"]').trigger("click");
    await flushPromises();

    expect(state.isFogShown).toBe(true);
  });

  test("reload restores the game's value", async () => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    registry.register({ commands: [], variables: [createFogVariable({ isFogShown: false })] });
    const component = mount(GenshinDevPanel, { props: { modelValue: true, registry } });

    await component.get('[role="switch"]').trigger("click");
    await flushPromises();
    component.unmount();

    // The panel keeps its open tab and no variable's value, so a switch set in one load is not in the browser's storage
    expect(Array.from({ length: localStorage.length }, (_value, index) => localStorage.key(index))).toStrictEqual([
      LocalStorageKey.GenshinDevPanelTab,
    ]);

    // A reload builds the game again from its own value, and the panel shows that value
    const reloaded = createDevRegistry();
    reloaded.register({ commands: [], variables: [createFogVariable({ isFogShown: false })] });
    const reloadedComponent = mount(GenshinDevPanel, { props: { modelValue: true, registry: reloaded } });

    expect(reloadedComponent.get('[role="switch"]').attributes("aria-checked")).toBe("false");
  });
});
