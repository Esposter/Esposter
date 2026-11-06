// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorContent from "@/components/Dashboard/Editor/Content.vue";
import DashboardGrid from "@/components/Dashboard/Grid/Index.vue";
import DashboardGridTile from "@/components/Dashboard/Grid/Tile.vue";
import DashboardVisualPreviewActionsMenu from "@/components/Dashboard/Visual/Preview/ActionsMenu.vue";
import DashboardVisualPreviewContainer from "@/components/Dashboard/Visual/Preview/Container.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import {
  DASHBOARD_EDITOR_ROW_HEIGHT,
  DASHBOARD_GRID_COMMANDS,
  DASHBOARD_GRID_MARGIN,
} from "@/services/dashboard/constants";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { useCommandStore } from "@/store/ui/command";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("dashboardEditorContent", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const gridWidth = 970;
  const menuLabel = '[aria-label="Visual actions"]';
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Dashboard });

  // Stubbed once for the file: an `unstubAllGlobals` after each test would also unstub the fetch `setupMswTrpc` stubs
  beforeAll(() => {
    stubGridWidth(gridWidth);
  });
  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.saveResourceContent.mutation(() => createResource(1));
  });

  // The editor draws its visuals off the loaded dashboard, and the page reads the row before any blade mounts
  const mountEditor = async (visuals: Visual[]) => {
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard({ visuals }));
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const dashboardStore = useDashboardStore();
    const { loadContent } = dashboardStore;
    await loadContent();
    const wrapper = await mountSuspended(DashboardEditorContent);
    await flushPromises();
    return wrapper;
  };

  // A menu's item picked on the tile of one visual, opened from the keyboard the way the overflow menu's own test opens it
  const pickTileMenuItem = async (wrapper: VueWrapper, visualId: Visual["id"], title: string) => {
    const menu = wrapper
      .findAllComponents(DashboardVisualPreviewActionsMenu)
      .find((item) => item.props("visual").id === visualId);
    assert(menu);
    await menu.get(menuLabel).trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    // A toggle item is a menuitemcheckbox, so the prefix reaches every row the menu lists
    await menu
      .findAll('[role^="menuitem"]')
      .find((item) => item.text() === title)
      ?.trigger("click");
    await flushPromises();
  };

  // A Delete picked on any tile's menu opens the one confirm the editor mounts, and nothing else on the grid mounts one
  test("one delete confirm serves every tile, titled for the tile whose Delete was picked", async () => {
    expect.hasAssertions();

    const tableVisual = new Visual({ type: VisualType.Table });
    const wrapper = await mountEditor([new Visual({ type: VisualType.Card }), tableVisual]);
    await pickTileMenuItem(wrapper, tableVisual.id, "Delete visual");

    expect(wrapper.findAllComponents(UiConfirmDialog).map((dialog) => dialog.props("title"))).toStrictEqual([
      "Delete Table visual",
    ]);
  });

  test("confirming deletes the visual whose tile asked, and no other", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const tableVisual = new Visual({ type: VisualType.Table, x: 4 });
    const wrapper = await mountEditor([cardVisual, tableVisual]);
    await pickTileMenuItem(wrapper, tableVisual.id, "Delete visual");
    await wrapper.getComponent(UiConfirmDialog).props("confirm")();
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map(({ id }) => id)).toStrictEqual([cardVisual.id]);
  });

  // The menu's Edit opens the form the inspector shows, and selects the visual that form is for
  test("an edit selects the visual whose menu picked it and opens its form", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const tableVisual = new Visual({ type: VisualType.Table, x: 4 });
    const wrapper = await mountEditor([cardVisual, tableVisual]);
    await pickTileMenuItem(wrapper, tableVisual.id, "Edit visual");
    const visualStore = useVisualStore();
    const { editedItem, selectedVisualId } = storeToRefs(visualStore);

    expect({ editedItemId: editedItem.value?.id, selectedVisualId: selectedVisualId.value }).toStrictEqual({
      editedItemId: tableVisual.id,
      selectedVisualId: tableVisual.id,
    });
  });

  test("deleting asks first", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const wrapper = await mountEditor([cardVisual]);
    await pickTileMenuItem(wrapper, cardVisual.id, "Delete visual");
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect({
      isOpen: wrapper.getComponent(UiConfirmDialog).props("modelValue"),
      visuals: visuals.value.map(({ id }) => id),
    }).toStrictEqual({ isOpen: true, visuals: [cardVisual.id] });
  });

  // A press with no move is the grid's release with nothing to commit, and the click that follows opens the visual
  test("a short drag is a click", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const wrapper = await mountEditor([cardVisual]);
    const pointer = { button: 0, clientX: 0, clientY: 0, pointerId: 1 };
    const tile = wrapper.get(".dashboard-grid-tile");
    await tile.trigger("pointerdown", pointer);
    await tile.trigger("pointerup", pointer);
    const preview = takeOne(wrapper.findAllComponents(DashboardVisualPreviewContainer));
    await preview.trigger("mousedown");
    await preview.trigger("click");
    const visualStore = useVisualStore();
    const { editedItem } = storeToRefs(visualStore);

    expect({ commits: wrapper.findComponent(DashboardGrid).emitted("commit"), id: editedItem.value?.id }).toStrictEqual(
      { commits: undefined, id: cardVisual.id },
    );
  });

  // A press on a visual selects it, and the canvas does not clear that selection on the same click
  test("Pressing a visual selects it", async () => {
    expect.hasAssertions();

    const barVisual = new Visual({ type: VisualType.Bar });
    const wrapper = await mountEditor([barVisual]);
    const visualStore = useVisualStore();
    const { selectedVisualId } = storeToRefs(visualStore);
    const selectedVisualIdBeforePress = selectedVisualId.value;
    const preview = takeOne(wrapper.findAllComponents(DashboardVisualPreviewContainer));
    await preview.trigger("mousedown");
    await preview.trigger("click");

    expect({ after: selectedVisualId.value, before: selectedVisualIdBeforePress }).toStrictEqual({
      after: barVisual.id,
      before: "",
    });
  });

  // Fit height is saved with the visual, and the rows it then takes are the rows its content draws
  // Its content needs two rows, so a table five rows tall takes two
  test("turning on fit height for a table", async () => {
    expect.hasAssertions();

    const saveResourceContent = vi.fn<
      (options: { input: { content: { visuals: Pick<Visual, "isAutoHeight">[] } } }) => ResourceInResource
    >(() => createResource(1));
    trpcMsw.dashboard.saveResourceContent.mutation(saveResourceContent);
    const table = new Visual({ h: 5, type: VisualType.Table });
    const wrapper = await mountEditor([table]);
    await pickTileMenuItem(wrapper, table.id, "Fit height to content");
    // The tile reports the height its content draws, two rows of the editor's cells with the gap between them
    takeOne(wrapper.findAllComponents(DashboardGridTile)).vm.$emit(
      "measure",
      DASHBOARD_EDITOR_ROW_HEIGHT * 2 + DASHBOARD_GRID_MARGIN,
    );
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect({
      h: takeOne(visuals.value).h,
      isAutoHeight: takeOne(visuals.value).isAutoHeight,
      saved: saveResourceContent.mock.lastCall?.[0].input.content.visuals.map(({ isAutoHeight }) => isAutoHeight),
    }).toStrictEqual({ h: 2, isAutoHeight: true, saved: [true] });
  });

  // A visual released over a group's grid is moved into that group, and the grid it was released on names the group
  test("a visual released over a group's grid moves into that group", async () => {
    expect.hasAssertions();

    const group = new Visual({ type: VisualType.Group, visuals: [] });
    const cardVisual = new Visual({ type: VisualType.Card, x: 4 });
    const wrapper = await mountEditor([group, cardVisual]);
    wrapper
      .findComponent(DashboardGrid)
      .vm.$emit("transfer", {
        cell: { h: cardVisual.h, w: cardVisual.w, x: 0, y: 0 },
        id: cardVisual.id,
        targetGroupId: group.id,
      });
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map((visual) => visual.visuals?.map(({ id }) => id))).toStrictEqual([[cardVisual.id]]);
  });

  // A visual released over the dashboard's own grid leaves the group it was in, and sits at the top level
  test("a visual released over the dashboard's own grid leaves its group", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const group = new Visual({ type: VisualType.Group, visuals: [cardVisual] });
    const wrapper = await mountEditor([group]);
    wrapper
      .findComponent(DashboardGrid)
      .vm.$emit("transfer", {
        cell: { h: cardVisual.h, w: cardVisual.w, x: 4, y: 0 },
        id: cardVisual.id,
        targetGroupId: undefined,
      });
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map(({ id, visuals: groupVisuals }) => [id, groupVisuals?.length])).toStrictEqual([
      [group.id, 0],
      [cardVisual.id, undefined],
    ]);
  });

  // A visual inside a group keeps its own tile and menu, so the group's grid draws each child the way the dashboard's grid does
  test("a visual inside a group gets its own menu in the editor", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const group = new Visual({ type: VisualType.Group, visuals: [cardVisual] });
    const wrapper = await mountEditor([group]);
    await flushPromises();

    // The group's corner menu follows the body that holds its child, as the template places it
    expect(
      wrapper.findAllComponents(DashboardVisualPreviewActionsMenu).map((menu) => menu.props("visual").id),
    ).toStrictEqual([cardVisual.id, group.id]);
  });

  // A group draws an editable grid of its own, and each grid takes the same keys, so the editor lists each one once
  test("lists each dashboard command once, though a group draws its own editable grid", async () => {
    expect.hasAssertions();

    await mountEditor([new Visual({ type: VisualType.Group, visuals: [new Visual({ type: VisualType.Card })] })]);
    const commandStore = useCommandStore();
    const { commands } = storeToRefs(commandStore);

    expect(commands.value.map(({ id }) => id)).toStrictEqual(DASHBOARD_GRID_COMMANDS.map(({ id }) => id));
  });

  // The grid's keys act on a visual, so the editor lists them only once the dashboard holds one to act on
  test("lists the dashboard commands only once the dashboard holds a visual", async () => {
    expect.hasAssertions();

    await mountEditor([]);
    const commandStore = useCommandStore();
    const { commands } = storeToRefs(commandStore);
    const commandIdsWhenEmpty = commands.value.map(({ id }) => id);
    const visualStore = useVisualStore();
    const { createVisual } = visualStore;
    createVisual(VisualType.Card);

    expect({ empty: commandIdsWhenEmpty, withVisual: commands.value.map(({ id }) => id) }).toStrictEqual({
      empty: [],
      withVisual: DASHBOARD_GRID_COMMANDS.map(({ id }) => id),
    });
  });

  // A group's delete names it and counts every visual it takes with it, down its whole tree
  test("a group's delete confirm says how many visuals it takes with it", async () => {
    expect.hasAssertions();

    const group = new Visual({
      type: VisualType.Group,
      visuals: [new Visual({ type: VisualType.Card }), new Visual({ type: VisualType.Table, x: 4 })],
    });
    const wrapper = await mountEditor([group]);
    await pickTileMenuItem(wrapper, group.id, "Delete visual");

    expect(wrapper.getComponent(UiConfirmDialog).text()).toBe(
      "Delete Group visualCloseDelete this group from the dashboard, and 2 visuals inside?CancelDelete",
    );
  });
});
