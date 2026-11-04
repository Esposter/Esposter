// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardVisualPreviewMoveDialog from "@/components/Dashboard/Visual/Preview/MoveDialog.vue";
import UiRadioGroup from "@/components/Ui/RadioGroup.vue";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

// The move writes into the dashboard the store holds, so the test starts from the visuals it names
const loadDashboard = (visuals: Visual[]) => {
  const dashboardStore = useDashboardStore();
  const { dashboard } = storeToRefs(dashboardStore);
  dashboard.value = new Dashboard({ visuals });
};

describe("dashboardVisualPreviewMoveDialog", () => {
  test("choosing a group moves the visual into it, and closes", async () => {
    expect.hasAssertions();

    const visual = new Visual({ type: VisualType.Card });
    const group = new Visual({ type: VisualType.Group, visuals: [] });
    loadDashboard([visual, group]);
    const wrapper = await mountSuspended(DashboardVisualPreviewMoveDialog, { props: { modelValue: true, visual } });
    wrapper.findComponent(UiRadioGroup).vm.$emit("update:modelValue", group.id);
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect({
      closed: wrapper.emitted("update:modelValue"),
      layout: visuals.value.map((top) => top.visuals?.map(({ id }) => id)),
    }).toStrictEqual({ closed: [[false]], layout: [[visual.id]] });
  });
});
