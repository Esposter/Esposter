// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardEditorHeader from "@/components/Dashboard/Editor/Header.vue";
import { useDashboardStore } from "@/store/dashboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("dashboardEditorHeader", () => {
  test("counts every visual of the tree, a group's included", async () => {
    expect.hasAssertions();

    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);
    dashboard.value = new Dashboard({
      visuals: [
        new Visual({
          type: VisualType.Group,
          visuals: [new Visual({ type: VisualType.Bar }), new Visual({ type: VisualType.Table, x: 4 })],
        }),
        new Visual({ type: VisualType.Card, x: 8 }),
      ],
    });
    const wrapper = await mountSuspended(DashboardEditorHeader);

    expect(wrapper.get("p").text()).toBe("4 visuals");
  });
});
