// @vitest-environment nuxt
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardVisualPreviewActionsMenu from "@/components/Dashboard/Visual/Preview/ActionsMenu.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useDashboardDialogStore } from "@/store/dashboard/dialog";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
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
  const resourceId = crypto.randomUUID();
  const menuLabel = '[aria-label="Visual actions"]';
  const responseColumn = "response";
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
      publication: null,
    }));
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard({ visuals }));
    trpcMsw.dashboard.saveResourceContent.mutation(() =>
      createResourceListItem({ contentVersion: 1, id: resourceId, type: ResourceType.Dashboard }),
    );
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const dashboardStore = useDashboardStore();
    const { loadContent } = dashboardStore;
    await loadContent();
  };

  test("a table's menu offers fit height to content", async () => {
    expect.hasAssertions();

    const table = new Visual({ type: VisualType.Table });
    await loadDashboard([table]);
    const menu = await mountMenu(table);

    await expect(openMenu(menu)).resolves.toContain("Fit height to content");
  });

  test("a chart's menu offers no fit height to content", async () => {
    expect.hasAssertions();

    const chart = new Visual({ type: VisualType.Bar });
    await loadDashboard([chart]);
    const menu = await mountMenu(chart);

    await expect(openMenu(menu)).resolves.not.toContain("Fit height to content");
  });

  test("a bound visual's menu offers its rows as an export", async () => {
    expect.hasAssertions();

    const bound = new Visual({
      dataset: {
        query: {
          series: [{ aggregation: DatasetAggregationType.Count, column: responseColumn }],
          xColumn: responseColumn,
        },
        reference: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
      },
      type: VisualType.Card,
    });
    await loadDashboard([bound]);
    const menu = await mountMenu(bound, dataset);

    await expect(openMenu(menu)).resolves.toContain("Export CSV");
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

    expect(items).toContain("Delete visual");
    expect(deletingVisualId.value).toBe(table.id);
    expect(visuals.value).toHaveLength(1);
  });
});
