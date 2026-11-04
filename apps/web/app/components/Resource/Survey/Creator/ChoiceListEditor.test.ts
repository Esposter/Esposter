// @vitest-environment nuxt
import ResourceSurveyCreatorChoiceListEditor from "@/components/Resource/Survey/Creator/ChoiceListEditor.vue";
import { getButtonByText } from "@/components/Resource/Survey/Creator/getButtonByText.test";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import UiForm from "@/components/Ui/Form.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorChoiceListEditor", () => {
  test("an added choice is written, and moving it up one place is a second write", async () => {
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
    expect(wrapper.emitted("update:modelValue")?.[1]).toStrictEqual([[red, green, blue]]);
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

  test("removing a row asks first, and removes it once confirmed", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const blue = { text: "Blue", value: "blue" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red, blue] },
    });
    await wrapper.find('button[aria-label="Remove choice 1"]').trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    await getButtonByText(wrapper, "Remove")?.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toStrictEqual([[blue]]);
  });

  test("declining leaves the row", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const blue = { text: "Blue", value: "blue" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red, blue] },
    });
    await wrapper.find('button[aria-label="Remove choice 1"]').trigger("click");
    await getButtonByText(wrapper, "Cancel")?.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
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

  test("an outside change that removes the row a removal asks about closes its confirm", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const blue = { text: "Blue", value: "blue" };
    const green = { text: "", value: "green" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red, blue, green] },
    });
    await wrapper.find('button[aria-label="Remove choice 2"]').trigger("click");

    expect(wrapper.findComponent(UiConfirmDialog).exists()).toBe(true);

    await wrapper.setProps({ modelValue: [red, green] });

    expect(wrapper.findComponent(UiConfirmDialog).exists()).toBe(false);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("an outside change that inserts a row above the one a removal asks about renumbers the confirm's title", async () => {
    expect.hasAssertions();
    const red = { text: "Red", value: "red" };
    const blue = { text: "Blue", value: "blue" };
    const green = { text: "", value: "green" };
    const pink = { text: "", value: "pink" };
    const wrapper = await mountSuspended(ResourceSurveyCreatorChoiceListEditor, {
      props: { label: "Choices", modelValue: [red, blue, green] },
    });
    await wrapper.find('button[aria-label="Remove choice 2"]').trigger("click");

    expect(wrapper.findComponent(UiConfirmDialog).props("title")).toBe("Remove choice 2?");

    await wrapper.setProps({ modelValue: [pink, red, blue, green] });

    expect(wrapper.findComponent(UiConfirmDialog).props("title")).toBe("Remove choice 3?");
  });
});
