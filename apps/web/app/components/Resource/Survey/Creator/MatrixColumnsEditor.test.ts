// @vitest-environment nuxt
import ResourceSurveyCreatorChoiceListEditor from "@/components/Resource/Survey/Creator/ChoiceListEditor.vue";
import { getButtonByText } from "@/components/Resource/Survey/Creator/getButtonByText.test";
import ResourceSurveyCreatorMatrixColumnsEditor from "@/components/Resource/Survey/Creator/MatrixColumnsEditor.vue";
import UiForm from "@/components/Ui/Form.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { SurveyMatrixCellType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorMatrixColumnsEditor", () => {
  test("a column added, renamed and removed reaches the list", async () => {
    expect.hasAssertions();
    const wrapper = await mountSuspended(ResourceSurveyCreatorMatrixColumnsEditor, {
      props: { label: "Columns", modelValue: [] },
    });
    await wrapper.find('input[placeholder="Column title"]').setValue("Often");
    wrapper.findComponent(UiForm).vm.$emit("submit");
    await wrapper.vm.$nextTick();
    wrapper.findAllComponents(UiTextField)[0]?.vm.$emit("update:modelValue", "Sometimes");
    await wrapper.vm.$nextTick();
    await wrapper.find('button[aria-label="Remove column 1"]').trigger("click");
    await getButtonByText(wrapper, "Remove")?.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toHaveLength(3);
    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([
      [{ cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: "Often", title: "Often" }],
    ]);
    expect(wrapper.emitted("update:modelValue")?.[1]).toStrictEqual([
      [{ cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: "Sometimes", title: "Often" }],
    ]);
    expect(wrapper.emitted("update:modelValue")?.[2]).toStrictEqual([[]]);
  });

  test("removing a row asks first, and removes it once confirmed", async () => {
    expect.hasAssertions();
    const often = {
      cellType: SurveyMatrixCellType.Text,
      choices: [],
      isRequired: false,
      name: "Often",
      title: "Often",
    };
    const sometimes = {
      cellType: SurveyMatrixCellType.Text,
      choices: [],
      isRequired: false,
      name: "Sometimes",
      title: "Sometimes",
    };
    const wrapper = await mountSuspended(ResourceSurveyCreatorMatrixColumnsEditor, {
      props: { label: "Columns", modelValue: [often, sometimes] },
    });
    await wrapper.find('button[aria-label="Remove column 1"]').trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    await getButtonByText(wrapper, "Remove")?.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([[sometimes]]);
  });

  test("declining leaves the row", async () => {
    expect.hasAssertions();
    const often = {
      cellType: SurveyMatrixCellType.Text,
      choices: [],
      isRequired: false,
      name: "Often",
      title: "Often",
    };
    const wrapper = await mountSuspended(ResourceSurveyCreatorMatrixColumnsEditor, {
      props: { label: "Columns", modelValue: [often] },
    });
    await wrapper.find('button[aria-label="Remove column 1"]').trigger("click");
    await getButtonByText(wrapper, "Cancel")?.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("a dynamic matrix column's cell type is set, and a choice cell takes its own choices", async () => {
    expect.hasAssertions();
    const wrapper = await mountSuspended(ResourceSurveyCreatorMatrixColumnsEditor, {
      props: {
        label: "Columns",
        modelValue: [{ cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: "often", title: "" }],
      },
    });
    wrapper.findComponent(UiSelect).vm.$emit("update:modelValue", SurveyMatrixCellType.Dropdown);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([
      [{ cellType: SurveyMatrixCellType.Dropdown, choices: [], isRequired: false, name: "often", title: "" }],
    ]);
    expect(wrapper.findComponent(ResourceSurveyCreatorChoiceListEditor).exists()).toBe(true);
  });
});
