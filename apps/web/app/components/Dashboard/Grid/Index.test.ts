// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import DashboardGrid from "@/components/Dashboard/Grid/Index.vue";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, assert, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

describe("dashboardGrid", () => {
  // Twelve columns across 970px with the dashboard's 10px gap and padding start 80px apart, and rows 40px high 50px apart
  const columnNumber = 12;
  const gridWidth = 970;
  const columnPitch = 80;
  const pointerId = 1;
  const rowHeight = 40;
  const collision = CollisionMode.Push;
  const compactType = CompactType.Vertical;

  beforeEach(() => {
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
          queueMicrotask(() => {
            this.#callback(entries, this);
          });
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
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    // A DOM without layout has no hit test, so the release hits the grid it was pressed on, as a browser would
    document.elementsFromPoint = () => [wrapper.element];
    onTestFinished(() => {
      Reflect.deleteProperty(document, "elementsFromPoint");
    });
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: columnPitch, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: columnPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toBeUndefined();

    await tile.trigger("pointerup", { clientX: columnPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 2, x: 2, y: 0 }]]]);
  });

  test("opening a dashboard draws each visual at its saved cell and size", async () => {
    expect.hasAssertions();

    // A full-width visual above the target keeps it from compacting up into the first row
    const wrapper = await mountSuspended(DashboardGrid, {
      props: {
        collision,
        columnNumber,
        compactType,
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
    }).toStrictEqual({ height: "90px", left: "250px", top: "60px", width: "150px" });
  });

  test("#54 Scrolling a published dashboard on a phone never captures the touch", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, rowHeight, visuals: [new Visual({ h: 2, w: 2, x: 0, y: 0 })] },
    });

    const tile = wrapper.get(".dashboard-grid-tile");
    assert(tile.element instanceof HTMLElement);

    expect(tile.element.style.touchAction).toBe("");
  });

  test("an editable tile takes a touch as its drag, so the page does not scroll under it", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardGrid, {
      props: {
        collision,
        columnNumber,
        compactType,
        isEditable: true,
        rowHeight,
        visuals: [new Visual({ h: 2, w: 2, x: 0, y: 0 })],
      },
    });

    const tile = wrapper.get(".dashboard-grid-tile");
    assert(tile.element instanceof HTMLElement);

    expect(tile.element.style.touchAction).toBe("none");
  });

  // The south-west handle moves the west edge and the south edge, so the visual keeps its top and its east edge
  test("a press on the south-west handle resizes the visual from its bottom-left corner", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 4, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    const handle = wrapper.get('[data-edge="SouthWest"]');
    await handle.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -columnPitch, clientY: 50, pointerId });
    await handle.trigger("pointerup", { clientX: -columnPitch, clientY: 50, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 3, id: visual.id, w: 3, x: 3, y: 0 }]]]);
  });

  test("shift with the down arrow saves a focused visual one row taller", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    await wrapper.get(".dashboard-grid-tile").trigger("keydown", { key: "ArrowDown", shiftKey: true });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 3, id: visual.id, w: 2, x: 0, y: 0 }]]]);
  });

  test("an arrow key that would move a visual past the grid's last column saves nothing", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: columnNumber - 2, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    await wrapper.get(".dashboard-grid-tile").trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  test("an arrow key onto another visual under block overlap saves nothing", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: {
        collision: CollisionMode.Prevent,
        columnNumber,
        compactType,
        isEditable: true,
        rowHeight,
        visuals: [visual, new Visual({ h: 2, w: 2, x: 2, y: 0 })],
      },
    });
    await takeOne(wrapper.findAll(".dashboard-grid-tile")).trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  test("enter opens the focused visual", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    await wrapper.get(".dashboard-grid-tile").trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted<[Visual]>("open")?.map(([emitted]) => emitted.id)).toStrictEqual([visual.id]);
  });
});
