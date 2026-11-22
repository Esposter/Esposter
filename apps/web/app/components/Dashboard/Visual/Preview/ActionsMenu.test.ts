// @vitest-environment nuxt
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardVisualPreviewActionsMenu from "#src/components/Dashboard/Visual/Preview/ActionsMenu.vue";
import { useReadOpenResource } from "#src/composables/resource/useReadOpenResource";
import { createBoundVisual } from "#src/services/dashboard/createBoundVisual.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDashboardDialogStore } from "#src/store/dashboard/dialog";
import { useDashboardStore } from "#src/store/dashboard/index";
import { useVisualStore } from "#src/store/dashboard/visual";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, onTestFinished, test } from "vitest";

// Each menu is mounted alone, so the rows read are its own and no other visual's menu is open beside it
const mountMenu = async (visual: Visual, menuDataset?: Dataset) => {
  const wrapper = await mountSuspended(DashboardVisualPreviewActionsMenu, {
    attachTo: document.body,
    props: { dataset: menuDataset, visual },
  });
  onTestFinished(() => {
    wrapper.unmount();
  });
  return wrapper;
};

describe("dashboardVisualPreviewActionsMenu", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const menuLabel = '[aria-label="Visual actions"]';
  const dataset: Dataset = { columns: [], rows: [] };
  // The menu's rows are listed once it is opened from the keyboard, the way the overflow menu's own test opens it
  const openMenu = async (wrapper: VueWrapper) => {
    await wrapper.get(menuLabel).trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    return wrapper.findAll('[role^="menuitem"]').map((item) => item.text());
  };
  const loadDashboard = async (visuals: Visual[]) => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Dashboard }),
      favorite: null,
      publication: null,
    }));
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard({ visuals }));
    trpcMsw.dashboard.saveResourceContent.mutation(() =>
      createResourceListItem({ contentVersion: 1, id: resourceId, type: ResourceType.Dashboard }),
    );
    const { readResource } = useReadOpenResource();
    await readResource();
    const dashboardStore = useDashboardStore();
    const { loadContent } = dashboardStore;
    await loadContent();
  };

  test("opening a visual's menu", async () => {
    expect.hasAssertions();

    const table = createBoundVisual({ type: VisualType.Table });
    await loadDashboard([table]);
    const menu = await mountMenu(table, dataset);

    await expect(openMenu(menu)).resolves.toStrictEqual([
      "Edit visual",
      "Duplicate visual",
      "Export CSV",
      "Fit height to content",
      "Delete visual",
    ]);
  });

  test("a chart's menu offers no fit height to content", async () => {
    expect.hasAssertions();

    const chart = new Visual({ type: VisualType.Bar });
    await loadDashboard([chart]);
    const menu = await mountMenu(chart);

    await expect(openMenu(menu)).resolves.toStrictEqual(["Edit visual", "Duplicate visual", "Delete visual"]);
  });

  test("a bound visual's menu offers its rows as an export", async () => {
    expect.hasAssertions();

    const bound = createBoundVisual({ type: VisualType.Card });
    await loadDashboard([bound]);
    const menu = await mountMenu(bound, dataset);

    await expect(openMenu(menu)).resolves.toStrictEqual([
      "Edit visual",
      "Duplicate visual",
      "Export CSV",
      "Delete visual",
    ]);
  });

  // Fit height is a write of its own, so it saves the flag onto the visual the menu was opened on
  test("fit height to content saves the flag onto its visual", async () => {
    expect.hasAssertions();

    await loadDashboard([new Visual({ type: VisualType.Table })]);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);
    const table = takeOne(visuals.value);
    const menu = await mountMenu(table);
    await openMenu(menu);
    const fitItem = menu.findAll('[role^="menuitem"]').find((item) => item.text() === "Fit height to content");
    await fitItem?.trigger("click");
    await flushPromises();

    expect(table.isAutoHeight).toBe(true);
  });

  // Delete never removes a visual from the menu: it names the visual for the one confirm, which asks before it acts
  test("delete names its visual for the confirm, and removes nothing by itself", async () => {
    expect.hasAssertions();

    const table = new Visual({ type: VisualType.Table });
    await loadDashboard([table]);
    const menu = await mountMenu(table);
    const dashboardDialogStore = useDashboardDialogStore();
    const { deletingVisualId } = storeToRefs(dashboardDialogStore);
    const items = await openMenu(menu);
    const deleteItem = menu.findAll('[role^="menuitem"]').find((item) => item.text() === "Delete visual");
    await deleteItem?.trigger("click");
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(items).toStrictEqual(["Edit visual", "Duplicate visual", "Fit height to content", "Delete visual"]);
    expect(deletingVisualId.value).toBe(table.id);
    expect(visuals.value).toHaveLength(1);
  });

  // A group holds no data to export, so its menu has the edit, the copy, the height, and the delete, and no Export CSV
  test("a group's menu offers its fit height and no export", async () => {
    expect.hasAssertions();

    const group = new Visual({ type: VisualType.Group, visuals: [] });
    await loadDashboard([group]);
    const menu = await mountMenu(group);

    await expect(openMenu(menu)).resolves.toStrictEqual([
      "Edit visual",
      "Duplicate visual",
      "Fit height to content",
      "Delete visual",
    ]);
  });

  // Move to is offered only where the visual has a list to move into: a visual beside a group has one, and a group alone has none
  test("move to is offered only where the visual has somewhere else to go", async () => {
    expect.hasAssertions();

    const card = new Visual({ type: VisualType.Card });
    const group = new Visual({ type: VisualType.Group, visuals: [], x: 4 });
    await loadDashboard([card, group]);
    const cardItems = await openMenu(await mountMenu(card));
    const groupItems = await openMenu(await mountMenu(group));

    expect({ card: cardItems, group: groupItems }).toStrictEqual({
      card: ["Edit visual", "Duplicate visual", "Move to…", "Delete visual"],
      group: ["Edit visual", "Duplicate visual", "Fit height to content", "Delete visual"],
    });
  });
});
