// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorContent from "@/components/Dashboard/Editor/Content.vue";
import DashboardGrid from "@/components/Dashboard/Grid/Index.vue";
import DashboardVisualPreviewActionsMenu from "@/components/Dashboard/Visual/Preview/ActionsMenu.vue";
import DashboardVisualPreviewEditFormDialog from "@/components/Dashboard/Visual/Preview/EditFormDialog.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { DASHBOARD_GRID_COMMANDS } from "@/services/dashboard/constants";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { useCommandStore } from "@/store/ui/command";
import { ResourceType } from "@esposter/db-schema";
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

  // A DOM without layout never reports the grid's width, so the observer reports the width the test lays it out at.
  // Stubbed once for the file: an `unstubAllGlobals` after each test would also unstub the fetch `setupMswTrpc` stubs
  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        readonly #callback: ResizeObserverCallback;

        constructor(callback: ResizeObserverCallback) {
          this.#callback = callback;
        }

        disconnect() {}
        observe(target: Element) {
          const entries = [{ contentRect: { height: 0, width: gridWidth }, target }] as ResizeObserverEntry[];
          queueMicrotask(() => {
            this.#callback(entries, this);
          });
        }
        unobserve() {}
      },
    );
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
    await menu
      .findAll('[role="menuitem"]')
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

  test("an edit opens the editor's one edit form on the visual whose menu picked it", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const tableVisual = new Visual({ type: VisualType.Table, x: 4 });
    const wrapper = await mountEditor([cardVisual, tableVisual]);
    await pickTileMenuItem(wrapper, tableVisual.id, "Edit visual");

    expect(
      wrapper.findAllComponents(DashboardVisualPreviewEditFormDialog).map((dialog) => dialog.props("modelValue").id),
    ).toStrictEqual([tableVisual.id]);
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

  // A group's delete names it and counts every visual it takes with it, down its whole tree
  test("a group's delete confirm says how many visuals it takes with it", async () => {
    expect.hasAssertions();

    const group = new Visual({
      type: VisualType.Group,
      visuals: [new Visual({ type: VisualType.Card }), new Visual({ type: VisualType.Table, x: 4 })],
    });
    const wrapper = await mountEditor([group]);
    await pickTileMenuItem(wrapper, group.id, "Delete visual");

    expect(wrapper.getComponent(UiConfirmDialog).text()).toContain(
      "Delete this group from the dashboard, and 2 visuals inside?",
    );
  });
});
