// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorContent from "@/components/Dashboard/Editor/Content.vue";
import DashboardVisualPreviewEditFormDialog from "@/components/Dashboard/Visual/Preview/EditFormDialog.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("dashboardEditorContent", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const gridWidth = 970;
  const deleteTableLabel = '[aria-label="Delete Table visual"]';
  const editLabel = '[aria-label="Edit visual"]';
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

  // A Delete pressed on any tile opens the one confirm the editor mounts, and nothing else on the grid mounts one
  test("one delete confirm serves every tile, titled for the tile whose Delete was pressed", async () => {
    expect.hasAssertions();

    const wrapper = await mountEditor([new Visual({ type: VisualType.Card }), new Visual({ type: VisualType.Table })]);
    await wrapper.get(deleteTableLabel).trigger("click");

    expect(wrapper.findAllComponents(UiConfirmDialog).map((dialog) => dialog.props("title"))).toStrictEqual([
      "Delete Table visual",
    ]);
  });

  test("confirming deletes the visual whose tile asked, and no other", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const tableVisual = new Visual({ type: VisualType.Table, x: 4 });
    const wrapper = await mountEditor([cardVisual, tableVisual]);
    await wrapper.get(deleteTableLabel).trigger("click");
    await wrapper.getComponent(UiConfirmDialog).props("confirm")();
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map(({ id }) => id)).toStrictEqual([cardVisual.id]);
  });

  test("an edit opens the editor's one edit form on the visual whose tile was clicked", async () => {
    expect.hasAssertions();

    const cardVisual = new Visual({ type: VisualType.Card });
    const tableVisual = new Visual({ type: VisualType.Table, x: 4 });
    const wrapper = await mountEditor([cardVisual, tableVisual]);
    await takeOne(wrapper.findAll(editLabel), 1).trigger("click");

    expect(
      wrapper.findAllComponents(DashboardVisualPreviewEditFormDialog).map((dialog) => dialog.props("modelValue").id),
    ).toStrictEqual([tableVisual.id]);
  });
});
