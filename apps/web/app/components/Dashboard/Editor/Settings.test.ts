// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";
import type { Mock } from "vitest";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorContent from "@/components/Dashboard/Editor/Content.vue";
import DashboardEditorSettings from "@/components/Dashboard/Editor/Settings.vue";
import { stubElementAtPoint } from "@/services/dashboard/grid/stubElementAtPoint.test";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, beforeAll, describe, expect, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

// The choices are radios, and the one chosen is the radio that reads checked
const chooseRadio = async (wrapper: VueWrapper, title: string) => {
  const radio = wrapper.findAll('[role="radio"]').find((item) => item.text().startsWith(title));
  await radio?.trigger("click");
  await flushPromises();
};

describe("dashboardEditorSettings", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  // The editor's grid is twelve columns across this width, a column pitch of 80px, the same as the grid's own suite
  const gridWidth = 970;
  const columnPitch = 80;
  const pointerId = 1;
  // Typed with the input the handler receives, so a test can assert what a choice saved
  type SaveResourceContent = (options: {
    input: { content: Pick<Dashboard, "collision" | "compactType"> };
  }) => ResourceInResource;
  let saveResourceContent: Mock<SaveResourceContent>;
  const loadDashboard = async (visuals: Visual[] = []) => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    saveResourceContent = vi.fn<SaveResourceContent>(() =>
      createResourceListItem({ contentVersion: 1, id: resourceId, type: ResourceType.Dashboard }),
    );
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Dashboard }),
      publication: null,
    }));
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard({ visuals }));
    trpcMsw.dashboard.saveResourceContent.mutation(saveResourceContent);
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const dashboardStore = useDashboardStore();
    const { loadContent } = dashboardStore;
    await loadContent();
  };
  // Stubbed once for the file: an `unstubAllGlobals` after each test would also unstub the fetch `setupMswTrpc` stubs
  beforeAll(() => {
    stubGridWidth(gridWidth);
  });

  // The grid beside the settings refuses a visual dropped onto another one under this choice, and the choice is saved
  test("choosing block overlap", async () => {
    expect.hasAssertions();

    await loadDashboard([
      new Visual({ h: 2, type: VisualType.Card, w: 2, x: 0, y: 0 }),
      new Visual({ h: 2, type: VisualType.Card, w: 2, x: 2, y: 0 }),
    ]);
    const settings = await mountSuspended(DashboardEditorSettings);
    const editor = await mountSuspended(DashboardEditorContent);
    await chooseRadio(settings, "Block overlap");
    stubElementAtPoint(editor.get(".dashboard-grid").element);
    const tile = takeOne(editor.findAll(".dashboard-grid-tile"));
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: columnPitch * 2, clientY: 0, pointerId });
    const refused = editor.get(".dashboard-grid-placeholder").attributes("data-refused");
    await tile.trigger("pointerup", { clientX: columnPitch * 2, clientY: 0, pointerId });
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect({
      cells: visuals.value.map(({ x, y }) => [x, y]),
      refused,
      saved: saveResourceContent.mock.lastCall?.[0].input.content.collision,
    }).toStrictEqual({
      cells: [
        [0, 0],
        [2, 0],
      ],
      refused: "true",
      saved: CollisionMode.Prevent,
    });
  });

  // A visual with a gap above it rises to the top row under the default packing
  // Free placement keeps the visual where it was placed, and the choice is saved
  test("choosing free placement", async () => {
    expect.hasAssertions();

    await loadDashboard([new Visual({ h: 2, type: VisualType.Card, w: 2, x: 0, y: 2 })]);
    const settings = await mountSuspended(DashboardEditorSettings);
    const editor = await mountSuspended(DashboardEditorContent);
    await flushPromises();
    const tile = takeOne(editor.findAll(".dashboard-grid-tile"));
    assert(tile.element instanceof HTMLElement);
    const packedTop = tile.element.style.top;
    await chooseRadio(settings, "Free placement");

    expect({
      packedTop,
      placedTop: tile.element.style.top,
      saved: saveResourceContent.mock.lastCall?.[0].input.content.compactType,
    }).toStrictEqual({ packedTop: "10px", placedTop: "110px", saved: CompactType.None });
  });

  test("a save the server refuses takes the choice back to the one it had", async () => {
    expect.hasAssertions();

    await loadDashboard();
    trpcMsw.dashboard.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const wrapper = await mountSuspended(DashboardEditorSettings);
    await chooseRadio(wrapper, "Swap places");
    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);

    expect(dashboard.value.collision).toBe(CollisionMode.Push);
  });
});
