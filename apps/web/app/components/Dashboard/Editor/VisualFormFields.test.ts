// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardEditorVisualFormFields from "@/components/Dashboard/Editor/VisualFormFields.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("dashboardEditorVisualFormFields", () => {
  test("editing a card offers only its label", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardEditorVisualFormFields, {
      props: { modelValue: new Visual({ type: VisualType.Card }) },
    });

    expect(wrapper.findAllComponents({ name: "UiSelect" }).map((select) => select.props("label"))).not.toContain(
      "Chart type",
    );
    expect(wrapper.findComponent(UiSchemaForm).exists()).toBe(false);
    expect(wrapper.findComponent(UiTextField).props("label")).toBe("Label");
  });

  test("editing a table offers no extra settings", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardEditorVisualFormFields, {
      props: { modelValue: new Visual({ type: VisualType.Table }) },
    });

    expect(wrapper.findAllComponents({ name: "UiSelect" }).map((select) => select.props("label"))).not.toContain(
      "Chart type",
    );
    expect(wrapper.findComponent(UiSchemaForm).exists()).toBe(false);
    expect(wrapper.findComponent(UiTextField).exists()).toBe(false);
  });
});
