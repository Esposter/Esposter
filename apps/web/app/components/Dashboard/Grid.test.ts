// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import DashboardGrid from "@/components/Dashboard/Grid.vue";
import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { getCellPosition, getCellSize, getColumnPitch } from "vue-grid-layout-headless/placement";

describe("dashboardGrid", () => {
  const columnNumber = 12;
  const gridWidth = 970;
  const spacing = { gap: DASHBOARD_GRID_MARGIN, padding: DASHBOARD_GRID_MARGIN };
  const cellPitch = getColumnPitch(gridWidth, columnNumber, spacing);
  const pointerId = 1;
  const rowHeight = 40;
  const rowPitch = rowHeight + DASHBOARD_GRID_MARGIN;

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(gridWidth);
    // A DOM without layout never reports the grid's width, so the observer reports the width the test lays it out at
    vi.stubGlobal(
      "ResizeObserver",
      class {
        readonly #callback: ResizeObserverCallback;

        constructor(callback: ResizeObserverCallback) {
          this.#callback = callback;
        }

        disconnect() {}
        observe() {
          const entries = [{ contentRect: { height: 0, width: gridWidth } }] as ResizeObserverEntry[];
          queueMicrotask(() => this.#callback(entries, this));
        }
        unobserve() {}
      },
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("#45 Dragging across several cells writes the visual once, after the release", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { columnNumber, isEditable: true, rowHeight, visuals: [visual] },
    });
    // A DOM without layout hits nothing, so the release is pointed at the grid it was pressed on, as a browser would hit it
    vi.spyOn(document, "elementFromPoint").mockReturnValue(wrapper.element);
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { clientX: cellPitch, clientY: 0, pointerId });
    await tile.trigger("pointermove", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.find(".dashboard-grid-placeholder").exists()).toBe(true);
    expect(wrapper.emitted("commit")).toBeUndefined();

    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 2, x: 2, y: 0 }]]]);
  });

  test("opening a dashboard draws each visual at its saved cell and size", async () => {
    expect.hasAssertions();

    // A full-width visual above the target keeps it from compacting up into the first row
    const wrapper = await mountSuspended(DashboardGrid, {
      props: {
        columnNumber,
        rowHeight,
        visuals: [new Visual({ h: 1, w: columnNumber, x: 0, y: 0 }), new Visual({ h: 2, w: 2, x: 3, y: 1 })],
      },
    });
    const tile = takeOne(wrapper.findAll(".dashboard-grid-tile"), 1);
    assert(tile.element instanceof HTMLElement);

    expect({
      height: tile.element.style.height,
      left: tile.element.style.left,
      top: tile.element.style.top,
      width: tile.element.style.width,
    }).toStrictEqual({
      height: `${getCellSize(2, rowPitch, spacing.gap)}px`,
      left: `${getCellPosition(3, cellPitch, spacing.padding)}px`,
      top: `${getCellPosition(1, rowPitch, spacing.padding)}px`,
      width: `${getCellSize(2, cellPitch, spacing.gap)}px`,
    });
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
