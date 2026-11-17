// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardEditorVisualFormFields from "#src/components/Dashboard/Editor/VisualFormFields.vue";
import UiSchemaForm from "#src/components/Ui/SchemaForm/Index.vue";
import UiTextField from "#src/components/Ui/TextField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";

describe("dashboardEditorVisualFormFields", () => {
  const altText = "Sales by region, largest first";

  test("editing a card offers its label and its alternative text", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardEditorVisualFormFields, {
      props: { modelValue: new Visual({ type: VisualType.Card }) },
    });

    expect(wrapper.findAllComponents({ name: "UiSelect" }).map((select) => select.props("label"))).not.toContain(
      "Chart type",
    );
    expect(wrapper.findComponent(UiSchemaForm).exists()).toBe(false);
    expect(wrapper.findAllComponents(UiTextField).map((field) => field.props("label"))).toStrictEqual([
      "Label",
      "Alternative text",
    ]);
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
    expect(wrapper.findAllComponents(UiTextField).map((field) => field.props("label"))).toStrictEqual([
      "Alternative text",
    ]);
  });

  test("the owner describes a visual", async () => {
    expect.hasAssertions();

    const visual = new Visual({ type: VisualType.Bar });
    const wrapper = await mountSuspended(DashboardEditorVisualFormFields, { props: { modelValue: visual } });
    const altTextField = wrapper
      .findAllComponents(UiTextField)
      .find((field) => field.props("label") === "Alternative text");
    assert.exists(altTextField);
    altTextField.vm.$emit("update:modelValue", altText);

    expect(visual.altText).toBe(altText);
  });
});
