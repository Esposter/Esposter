// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorLayout from "@/components/Dashboard/Editor/Layout.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { CollisionMode } from "vue-grid-layout-headless";

describe("dashboardEditorLayout", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const layoutLabel = '[aria-label="Layout"]';
  const loadDashboard = async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Dashboard }),
      publication: null,
    }));
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard());
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
  // The choices are radios, and the one chosen is the radio that reads checked
  const chooseRadio = async (wrapper: VueWrapper, title: string) => {
    await wrapper.get(layoutLabel).trigger("click");
    await flushPromises();
    const radio = wrapper.findAll('[role="radio"]').find((item) => item.text().startsWith(title));
    await radio?.trigger("click");
    await flushPromises();
  };

  test("choosing block overlap saves it onto the dashboard", async () => {
    expect.hasAssertions();

    await loadDashboard();
    const wrapper = await mountSuspended(DashboardEditorLayout, { attachTo: document.body });
    await chooseRadio(wrapper, "Block overlap");
    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);

    expect(dashboard.value.collision).toBe(CollisionMode.Prevent);
  });

  test("a save the server refuses takes the choice back to the one it had", async () => {
    expect.hasAssertions();

    await loadDashboard();
    trpcMsw.dashboard.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const wrapper = await mountSuspended(DashboardEditorLayout, { attachTo: document.body });
    await chooseRadio(wrapper, "Swap places");
    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);

    expect(dashboard.value.collision).toBe(CollisionMode.Push);
  });
});
