// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorContent from "@/components/Dashboard/Editor/Content.vue";
import DashboardVisualPreviewActionsMenu from "@/components/Dashboard/Visual/Preview/ActionsMenu.vue";
import DashboardVisualPreviewEditFormDialog from "@/components/Dashboard/Visual/Preview/EditFormDialog.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
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
});
