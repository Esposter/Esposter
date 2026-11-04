// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardEditorHeader from "@/components/Dashboard/Editor/Header.vue";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
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

  test("adding a visual to a dashboard with visuals", async () => {
    expect.hasAssertions();

    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);
    dashboard.value = new Dashboard({
      visuals: [new Visual({ type: VisualType.Card }), new Visual({ type: VisualType.Card, x: 4 })],
    });
    const wrapper = await mountSuspended(DashboardEditorHeader);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Add visual")
      ?.trigger("click");
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(visuals.value.map(({ type, x, y }) => ({ type, x, y }))).toStrictEqual([
      { type: VisualType.Card, x: 0, y: 0 },
      { type: VisualType.Card, x: 4, y: 0 },
      { type: VisualType.Area, x: 8, y: 0 },
    ]);
  });
});
