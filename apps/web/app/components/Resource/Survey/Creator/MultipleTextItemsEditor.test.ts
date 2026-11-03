// @vitest-environment nuxt
import ResourceSurveyCreatorMultipleTextItemsEditor from "@/components/Resource/Survey/Creator/MultipleTextItemsEditor.vue";
import UiForm from "@/components/Ui/Form.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { SurveyMultipleTextItemInputType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorMultipleTextItemsEditor", () => {
  test("an item added and given an input type reaches the list", async () => {
    expect.hasAssertions();
    const wrapper = await mountSuspended(ResourceSurveyCreatorMultipleTextItemsEditor, {
      props: { label: "Items", modelValue: [] },
    });
    await wrapper.find('input[placeholder="Item name"]').setValue("Email");
    wrapper.findComponent(UiForm).vm.$emit("submit");
    await wrapper.vm.$nextTick();
    wrapper.findComponent(UiSelect).vm.$emit("update:modelValue", SurveyMultipleTextItemInputType.Email);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([
      [{ inputType: SurveyMultipleTextItemInputType.Text, isRequired: false, name: "Email", title: "Email" }],
    ]);
    expect(wrapper.emitted("update:modelValue")?.[1]).toStrictEqual([
      [{ inputType: SurveyMultipleTextItemInputType.Email, isRequired: false, name: "Email", title: "Email" }],
    ]);
  });
});
