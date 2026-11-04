// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { createGroupChain } from "#shared/services/dashboard/createGroupChain.test";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import DashboardGrid from "@/components/Dashboard/Grid/Index.vue";
import { useDashboardStore } from "@/store/dashboard";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

// A DOM without layout has no hit test, so the element under a release is the one the test names, as a browser would
const stubElementAtPoint = (element: Element) => {
  document.elementsFromPoint = () => [element];
  onTestFinished(() => {
    Reflect.deleteProperty(document, "elementsFromPoint");
  });
};

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

  test("dragging across several cells", async () => {
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
    const placeholder = wrapper.get(".dashboard-grid-placeholder");
    assert(placeholder.element instanceof HTMLElement);

    expect({ commits: wrapper.emitted("commit"), left: placeholder.element.style.left }).toStrictEqual({
      commits: undefined,
      left: "170px",
    });

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

  test("scrolling a published dashboard on a phone", async () => {
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

  test("a touch press on a handle moves the visual", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    // A touch moves the visual, so the release asks which grid is under the pointer, and this DOM has no hit test to answer
    stubElementAtPoint(wrapper.element);
    const handle = wrapper.get('[data-edge="SouthEast"]');
    await handle.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId, pointerType: "touch" });
    await handle.trigger("pointermove", { buttons: 1, clientX: columnPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: columnPitch, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 2, x: 1, y: 0 }]]]);
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

  // A body drag released over another grid is handed to it with the group that grid stands for, read from its root. The
  // Grid under the pointer is stubbed, since a DOM without layout has no hit test, and the target mounts as a group's grid does
  test.each([
    ["a group's grid", crypto.randomUUID()],
    ["the dashboard's own grid", undefined],
  ])(
    "a body drag released over %s hands the visual over with that grid's group",
    async (_description, targetGroupId) => {
      expect.hasAssertions();

      const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
      const wrapper = await mountSuspended(DashboardGrid, {
        props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
      });
      const target = await mountSuspended(DashboardGrid, {
        attrs: { "data-group-id": targetGroupId },
        props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [] },
      });
      stubElementAtPoint(target.element);
      // The release lands in the target's first cell, past its padding
      const releasePoint = { clientX: 10, clientY: 10 };
      const tile = wrapper.get(".dashboard-grid-tile");
      await tile.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
      await tile.trigger("pointermove", { buttons: 1, ...releasePoint, pointerId });
      await tile.trigger("pointerup", { ...releasePoint, pointerId });

      expect(wrapper.emitted("transfer")).toStrictEqual([
        [{ cell: { h: 2, w: 2, x: 0, y: 0 }, id: visual.id, targetGroupId }],
      ]);
    },
  );

  // The group at the depth cap holds one visual, which the drop lands on. The dragged group holds a group of its own, so a move
  // Into the cap group would nest it past the cap, and the grid it is dropped on refuses it before that visual is pushed aside
  test("a body drag into a group its move would nest past the depth cap changes no visual's cell", async () => {
    expect.hasAssertions();

    const chain = createGroupChain(MAX_VISUAL_GROUP_DEPTH + 1);
    const cappedGroup = takeOne(listVisuals(chain), MAX_VISUAL_GROUP_DEPTH);
    const child = takeOne(cappedGroup.visuals ?? []);
    Object.assign(child, { h: 2, w: 2, x: 0, y: 0 });
    const movedGroup = new Visual({
      h: 2,
      type: VisualType.Group,
      visuals: [new Visual({ type: VisualType.Group, visuals: [] })],
      w: 2,
      x: 0,
      y: 0,
    });
    const visuals = [...chain, movedGroup];
    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);
    dashboard.value = new Dashboard({ visuals });
    const getCells = () => listVisuals(visuals).map(({ h, id, w, x, y }) => ({ h, id, w, x, y }));
    const cellsBefore = getCells();
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [movedGroup] },
    });
    const target = await mountSuspended(DashboardGrid, {
      attrs: { "data-group-id": cappedGroup.id },
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [child] },
    });
    stubElementAtPoint(target.element);
    // The release lands on the child's cell, past the target's padding
    const releasePoint = { clientX: 10, clientY: 10 };
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, ...releasePoint, pointerId });
    await tile.trigger("pointerup", { ...releasePoint, pointerId });

    expect(target.emitted("commit")).toBeUndefined();
    expect(wrapper.emitted("transfer")).toBeUndefined();
    expect(getCells()).toStrictEqual(cellsBefore);
  });

  test("dropping a visual onto another", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const other = new Visual({ h: 2, w: 2, x: 2, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual, other] },
    });
    stubElementAtPoint(wrapper.element);
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: columnPitch * 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: columnPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([
      [
        [
          { h: 2, id: visual.id, w: 2, x: 2, y: 0 },
          { h: 2, id: other.id, w: 2, x: 2, y: 2 },
        ],
      ],
    ]);
  });

  test("swapping places with the visual dropped on", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const other = new Visual({ h: 2, w: 2, x: 2, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: {
        collision: CollisionMode.Swap,
        columnNumber,
        compactType,
        isEditable: true,
        rowHeight,
        visuals: [visual, other],
      },
    });
    stubElementAtPoint(wrapper.element);
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: columnPitch * 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: columnPitch * 2, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([
      [
        [
          { h: 2, id: other.id, w: 2, x: 0, y: 0 },
          { h: 2, id: visual.id, w: 2, x: 2, y: 0 },
        ],
      ],
    ]);
  });

  // The top-left handle moves the west and north edges, so a drag past the bottom-right corner clamps the visual to one cell
  test("shrinking a visual to nothing", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 2, y: 1 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType: CompactType.None, isEditable: true, rowHeight, visuals: [visual] },
    });
    const handle = wrapper.get('[data-edge="NorthWest"]');
    await handle.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: columnPitch * 3, clientY: 150, pointerId });
    await handle.trigger("pointerup", { clientX: columnPitch * 3, clientY: 150, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 1, id: visual.id, w: 1, x: 3, y: 2 }]]]);
  });

  test("resizing from a side", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 2, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    const handle = wrapper.get('[data-edge="West"]');
    await handle.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -columnPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: -columnPitch, clientY: 0, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 3, x: 1, y: 0 }]]]);
  });

  test("resizing from a corner", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 1 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType: CompactType.None, isEditable: true, rowHeight, visuals: [visual] },
    });
    const handle = wrapper.get('[data-edge="NorthEast"]');
    await handle.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: columnPitch, clientY: -50, pointerId });
    await handle.trigger("pointerup", { clientX: columnPitch, clientY: -50, pointerId });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 3, id: visual.id, w: 3, x: 0, y: 0 }]]]);
  });

  test("moving with the arrow keys", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    await wrapper.get(".dashboard-grid-tile").trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.emitted("commit")).toStrictEqual([[[{ h: 2, id: visual.id, w: 2, x: 1, y: 0 }]]]);
  });

  test("a step that changes a sized-to-content visual's height changes nothing", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, isAutoHeight: true, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });
    // The tile's content is measured once it mounts, and that measure is a commit of its own, so the step is read against it
    await flushPromises();
    const commitsBeforeStep = wrapper.emitted("commit");
    await wrapper.get(".dashboard-grid-tile").trigger("keydown", { key: "ArrowDown", shiftKey: true });

    expect(wrapper.emitted("commit")).toStrictEqual(commitsBeforeStep);
  });

  // A sized-to-content visual draws handles only on its sides, so its bottom edge has no handle to drag
  test("a sized-to-content visual's bottom edge changes nothing", async () => {
    expect.hasAssertions();

    const visual = new Visual({ h: 2, isAutoHeight: true, w: 2, x: 0, y: 0 });
    const wrapper = await mountSuspended(DashboardGrid, {
      props: { collision, columnNumber, compactType, isEditable: true, rowHeight, visuals: [visual] },
    });

    expect(wrapper.findAll(".dashboard-grid-handle").map((handle) => handle.attributes("data-edge"))).toStrictEqual([
      "East",
      "West",
    ]);
  });
});
