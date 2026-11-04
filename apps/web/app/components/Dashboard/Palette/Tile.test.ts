// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { createGroupChain } from "#shared/services/dashboard/createGroupChain.test";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import DashboardGrid from "@/components/Dashboard/Grid/Index.vue";
import DashboardPaletteTile from "@/components/Dashboard/Palette/Tile.vue";
import { stubElementAtPoint } from "@/services/dashboard/grid/stubElementAtPoint.test";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

// The palette writes into the dashboard the store holds, so each test starts from the visuals it is given rather than a read
const loadDashboard = (visuals: Visual[] = []) => {
  const dashboardStore = useDashboardStore();
  const { dashboard } = storeToRefs(dashboardStore);
  dashboard.value = new Dashboard({ visuals });
};

describe("dashboardPaletteTile", () => {
  const pointerId = 1;
  const columnNumber = 12;
  const gridWidth = 970;
  // With the grid's padding and columns, this point lands in the third column of the first row
  const cellPoint = { x: 170, y: 10 };
  const outsidePoint = { x: -50, y: -50 };
  const createGrid = async (visuals: Visual[] = [], collision = CollisionMode.Push) => {
    const grid = await mountSuspended(DashboardGrid, {
      attachTo: document.body,
      props: { collision, columnNumber, compactType: CompactType.Vertical, isEditable: true, rowHeight: 40, visuals },
    });
    onTestFinished(() => {
      grid.unmount();
    });
    return grid;
  };
  // A press on the tile, a move and a release at the point, the way a browser delivers a palette drag
  const dragTileTo = async (tile: VueWrapper, point: { x: number; y: number }, elementAtPoint: Element) => {
    stubElementAtPoint(elementAtPoint);
    const button = tile.get("button");
    await button.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0, pointerId });
    await button.trigger("pointermove", { buttons: 1, clientX: point.x, clientY: point.y, pointerId });
    await button.trigger("pointerup", { clientX: point.x, clientY: point.y, pointerId });
    await flushPromises();
  };

  beforeEach(() => {
    stubGridWidth(gridWidth);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // A press with no move is a click, which adds the visual at the first free cell the dashboard has
  test("pressing a tile adds a visual of its type at the first free cell", async () => {
    expect.hasAssertions();

    loadDashboard();
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Bar", type: VisualType.Bar },
    });
    await tile.get("button").trigger("click");
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value).toHaveLength(1);
    const [visual] = visuals.value;
    expect({ type: visual?.type, w: visual?.w, x: visual?.x, y: visual?.y }).toStrictEqual({
      type: VisualType.Bar,
      w: 4,
      x: 0,
      y: 0,
    });
    tile.unmount();
  });

  test("activating a tile", async () => {
    expect.hasAssertions();

    loadDashboard([new Visual({ type: VisualType.Card })]);
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Table", type: VisualType.Table },
    });
    await tile.get("button").trigger("click");
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map(({ type, x, y }) => ({ type, x, y }))).toStrictEqual([
      { type: VisualType.Card, x: 0, y: 0 },
      { type: VisualType.Table, x: 4, y: 0 },
    ]);
    tile.unmount();
  });

  // A release over the grid places the visual where it is released, not where the press began
  test("a tile dropped on the grid adds a visual where it is released", async () => {
    expect.hasAssertions();

    loadDashboard();
    const grid = await createGrid();
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Bar", type: VisualType.Bar },
    });
    await dragTileTo(tile, cellPoint, grid.element);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    const [visual] = visuals.value;
    expect({ type: visual?.type, x: visual?.x, y: visual?.y }).toStrictEqual({ type: VisualType.Bar, x: 2, y: 0 });
    tile.unmount();
  });

  test("a tile released outside the grid adds nothing", async () => {
    expect.hasAssertions();

    loadDashboard();
    await createGrid();
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Line", type: VisualType.Line },
    });
    await dragTileTo(tile, outsidePoint, document.body);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value).toStrictEqual([]);
    tile.unmount();
  });

  test("a tile released on a visual under block overlap adds nothing", async () => {
    expect.hasAssertions();

    loadDashboard();
    const grid = await createGrid([new Visual({ h: 4, w: 4, x: 2, y: 0 })], CollisionMode.Prevent);
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Bar", type: VisualType.Bar },
    });
    await dragTileTo(tile, cellPoint, grid.element);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value).toStrictEqual([]);
    tile.unmount();
  });

  // The group's grid is the one under the release, and its root names the group, so the visual is added inside that group
  test("a tile dropped on a group's grid adds a visual inside that group", async () => {
    expect.hasAssertions();

    const group = new Visual({ type: VisualType.Group, visuals: [] });
    loadDashboard([group]);
    const groupGrid = await mountSuspended(DashboardGrid, {
      attachTo: document.body,
      attrs: { "data-group-id": group.id },
      props: {
        collision: CollisionMode.Push,
        columnNumber,
        compactType: CompactType.Vertical,
        isEditable: true,
        rowHeight: 40,
        visuals: [],
      },
    });
    onTestFinished(() => {
      groupGrid.unmount();
    });
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Bar", type: VisualType.Bar },
    });
    await dragTileTo(tile, cellPoint, groupGrid.element);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map(({ visuals: groupVisuals }) => groupVisuals?.map(({ type }) => type))).toStrictEqual([
      [VisualType.Bar],
    ]);
    tile.unmount();
  });

  // A group added to the group at the depth cap would sit one level past it, so the drop is refused before the visual the
  // Release lands on is pushed aside, and nothing is added
  test("a group tile dropped on a group at the depth cap adds nothing and pushes nothing", async () => {
    expect.hasAssertions();

    const chain = createGroupChain(MAX_VISUAL_GROUP_DEPTH + 1);
    const cappedGroup = takeOne(listVisuals(chain), MAX_VISUAL_GROUP_DEPTH);
    const child = takeOne(cappedGroup.visuals ?? []);
    Object.assign(child, { h: 2, w: 2, x: 2, y: 0 });
    loadDashboard(chain);
    const groupGrid = await mountSuspended(DashboardGrid, {
      attachTo: document.body,
      attrs: { "data-group-id": cappedGroup.id },
      props: {
        collision: CollisionMode.Push,
        columnNumber,
        compactType: CompactType.Vertical,
        isEditable: true,
        rowHeight: 40,
        visuals: [child],
      },
    });
    onTestFinished(() => {
      groupGrid.unmount();
    });
    const tile = await mountSuspended(DashboardPaletteTile, {
      attachTo: document.body,
      props: { title: "Group", type: VisualType.Group },
    });
    await dragTileTo(tile, cellPoint, groupGrid.element);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(groupGrid.emitted("commit")).toBeUndefined();
    expect(listVisuals(visuals.value)).toHaveLength(MAX_VISUAL_GROUP_DEPTH + 2);
    tile.unmount();
  });
});
