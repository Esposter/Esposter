// @vitest-environment nuxt
import ResourceSurveyCreatorChoiceListEditor from "@/components/Resource/Survey/Creator/ChoiceListEditor.vue";
import UiForm from "@/components/Ui/Form.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorChoiceListEditor", () => {
  test("an added choice is written, and moving it to the top is a second write", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const blue = { text: "Blue", value: "blue" };
    const green = { text: "", value: "green" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red, blue] },
    });
    await wrapper.find('input[placeholder="Value or value|text"]').setValue("green");
    wrapper.findComponent(UiForm).vm.$emit("submit");
    await wrapper.vm.$nextTick();
    await wrapper.findAll('[role="group"]')[2]?.trigger("keydown", { altKey: true, key: "ArrowUp" });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([[red, blue, green]]);
    expect(wrapper.emitted("update:modelValue")?.[1]).toStrictEqual([[green, red, blue]]);
  });

  test("a repeated value is flagged on its row and the list is not written", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red] },
    });
    await wrapper.find('input[placeholder="Value or value|text"]').setValue("red");
    wrapper.findComponent(UiForm).vm.$emit("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Choice values must be unique");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("lines pasted into the add field become a row each", async () => {
    expect.hasAssertions();
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [] },
    });
    const paste = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(paste, "clipboardData", { value: { getData: () => "green\nyellow|Yellow" } });
    wrapper.find('input[placeholder="Value or value|text"]').element.dispatchEvent(paste);
    await wrapper.vm.$nextTick();

    expect(paste.defaultPrevented).toBe(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([
      [
        { text: "", value: "green" },
        { text: "Yellow", value: "yellow" },
      ],
    ]);
  });

  test("a removed row is written without its choice", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const blue = { text: "Blue", value: "blue" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red, blue] },
    });
    await wrapper.find('button[aria-label="Remove row 1"]').trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([[blue]]);
  });

  test("an edited value that is refused stays in its field, unwritten", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red] },
    });
    wrapper.findAllComponents(UiTextField)[0]?.vm.$emit("update:modelValue", "");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("A choice needs a value");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
