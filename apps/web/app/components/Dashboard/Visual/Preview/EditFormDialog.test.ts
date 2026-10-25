// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardVisualPreviewEditFormDialog from "@/components/Dashboard/Visual/Preview/EditFormDialog.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { useVisualStore } from "@/store/dashboard/visual";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("dashboardVisualPreviewEditFormDialog", () => {
  test("Editing a card offers only its label", async () => {
    expect.hasAssertions();

    // The dialog draws its body only while the store has it open, as an edit of a visual does
    const { isEditFormDialogOpen } = storeToRefs(useVisualStore());
    isEditFormDialogOpen.value = true;
    const wrapper = await mountSuspended(DashboardVisualPreviewEditFormDialog, {
      props: { modelValue: new Visual({ type: VisualType.Card }) },
    });

    expect(wrapper.findAllComponents(UiSelect).map((select) => select.props("label"))).not.toContain("Chart type");
    expect(wrapper.findComponent(UiSchemaForm).exists()).toBe(false);
    expect(wrapper.findComponent(UiTextField).props("label")).toBe("Label");
  });

  test("Editing a table offers no extra settings", async () => {
    expect.hasAssertions();

    // The dialog draws its body only while the store has it open, as an edit of a visual does
    const { isEditFormDialogOpen } = storeToRefs(useVisualStore());
    isEditFormDialogOpen.value = true;
    const wrapper = await mountSuspended(DashboardVisualPreviewEditFormDialog, {
      props: { modelValue: new Visual({ type: VisualType.Table }) },
    });

    expect(wrapper.findAllComponents(UiSelect).map((select) => select.props("label"))).not.toContain("Chart type");
    expect(wrapper.findComponent(UiSchemaForm).exists()).toBe(false);
    expect(wrapper.findComponent(UiTextField).exists()).toBe(false);
  });
});
