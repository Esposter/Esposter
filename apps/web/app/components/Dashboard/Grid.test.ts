// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import DashboardGrid from "@/components/Dashboard/Grid.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("dashboardGrid", () => {
  // A 970 pixel grid of 12 columns leaves each column 70 pixels wide, so a cell is 80 pixels across and 50 down
  const columnNumber = 12;
  const gridWidth = 970;
  const cellPitch = 80;
  const pointerId = 1;
  const rowHeight = 40;

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(gridWidth);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("A short drag is a click", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardGrid, {
      props: { columnNumber, isEditable: true, rowHeight, visuals: [new Visual({ h: 2, w: 2, x: 0, y: 0 })] },
    });
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { clientX: 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: 2, clientY: 0, pointerId });

    expect(wrapper.find(".dashboard-grid-placeholder").exists()).toBe(false);
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  test("#45 Dragging across several cells writes the visual once, after the release", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { columnNumber, isEditable: true, rowHeight, visuals: [visual] },
    });
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { clientX: cellPitch, clientY: 0, pointerId });
    await tile.trigger("pointermove", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.find(".dashboard-grid-placeholder").exists()).toBe(true);
    expect(wrapper.emitted("commit")).toBeUndefined();

    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 2, x: 2, y: 0 }]]]);
  });

  test("#2 keeps tracking a drag whose pointer has left its tile", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { columnNumber, isEditable: true, rowHeight, visuals: [visual] },
    });
    const grid = wrapper.get(".dashboard-grid");
    await wrapper.get(".dashboard-grid-tile").trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await grid.trigger("pointermove", { clientX: cellPitch * 2, clientY: 0, pointerId });
    await grid.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 2, x: 2, y: 0 }]]]);
  });

  test("#54 Scrolling a published dashboard on a phone never captures the touch", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardGrid, {
      props: { columnNumber, rowHeight, visuals: [new Visual({ h: 2, w: 2, x: 0, y: 0 })] },
    });

    expect(wrapper.get(".dashboard-grid-tile").attributes("style")).not.toContain("touch-action");
  });

  test("an editable tile takes a touch as its drag, so the page does not scroll under it", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardGrid, {
      props: { columnNumber, isEditable: true, rowHeight, visuals: [new Visual({ h: 2, w: 2, x: 0, y: 0 })] },
    });

    expect(wrapper.get(".dashboard-grid-tile").attributes("style")).toContain("touch-action: none");
  });
});
