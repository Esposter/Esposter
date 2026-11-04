// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardGrid from "@/components/Dashboard/Grid/Index.vue";
import DashboardVisualGroup from "@/components/Dashboard/Visual/Group.vue";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

const createGroup = (visuals: Visual[], title = "") => {
  const group = new Visual({ type: VisualType.Group, visuals });
  group.chart.configuration.title = title;
  return group;
};

describe("dashboardVisualGroup", () => {
  const collision = CollisionMode.Push;
  const compactType = CompactType.Vertical;
  const gridWidth = 970;
  // Each child is drawn by the caller's slot, which here marks it by its type so the test reads the children it drew
  const childSlots = {
    default: (slotProps: { visual: Visual }) => h("span", { class: "child" }, slotProps.visual.type),
  };

  // A DOM without layout never reports the width, so the observers report the width the group lays out at
  beforeEach(() => {
    stubGridWidth(gridWidth);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mountGroup = (visual: Visual, isEditable?: true) =>
    mountSuspended(DashboardVisualGroup, { props: { collision, compactType, isEditable, visual }, slots: childSlots });

  test("shows each visual a group holds on the group's own grid", async () => {
    expect.hasAssertions();

    const group = createGroup(
      [new Visual({ type: VisualType.Bar }), new Visual({ type: VisualType.Table, x: 4 })],
      "Sales",
    );
    const wrapper = await mountGroup(group);
    // A published group mounts its grid once it knows its width, and the grid draws its tiles once it knows its own
    await flushPromises();

    expect(wrapper.get("header").text()).toBe("Sales");
    expect(wrapper.findAll(".child").map((child) => child.text())).toStrictEqual([VisualType.Bar, VisualType.Table]);
  });

  test("names the nested grid's root with the group's own visual id", async () => {
    expect.hasAssertions();

    const group = createGroup([new Visual({ type: VisualType.Bar })], "Sales");
    const wrapper = await mountGroup(group);

    expect(wrapper.get("[data-group-id]").attributes("data-group-id")).toBe(group.id);
  });

  test("heads an untitled group in the editor as Untitled group", async () => {
    expect.hasAssertions();

    const wrapper = await mountGroup(createGroup([]), true);

    expect(wrapper.get("header").text()).toBe("Untitled group");
  });

  test("a published group draws no header when it is untitled", async () => {
    expect.hasAssertions();

    const wrapper = await mountGroup(createGroup([new Visual({ type: VisualType.Bar })]));

    expect(wrapper.find("header").exists()).toBe(false);
  });

  test("tells the owner how to fill an empty group", async () => {
    expect.hasAssertions();

    const wrapper = await mountGroup(createGroup([]), true);

    expect(wrapper.text()).toContain("Drop a visual here");
    expect(wrapper.text()).toContain("Or choose Move to in a visual's menu");
  });

  test("hands a nested grid's commit, open and transfer up to its caller", async () => {
    expect.hasAssertions();

    const child = new Visual({ type: VisualType.Bar });
    const group = createGroup([child], "Sales");
    const wrapper = await mountGroup(group, true);
    const nestedGrid = wrapper.findComponent(DashboardGrid);
    const cell = { h: 2, w: 2, x: 0, y: 0 };
    nestedGrid.vm.$emit("commit", [{ ...cell, id: child.id }]);
    nestedGrid.vm.$emit("open", child);
    nestedGrid.vm.$emit("transfer", { cell, id: child.id, targetGroupId: undefined });

    expect({
      commit: wrapper.emitted("commit"),
      open: wrapper.emitted("open"),
      transfer: wrapper.emitted("transfer"),
    }).toStrictEqual({
      commit: [[[{ ...cell, id: child.id }]]],
      open: [[child]],
      transfer: [[{ cell, id: child.id, targetGroupId: undefined }]],
    });
  });
});
