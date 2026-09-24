// @vitest-environment happy-dom
import UiForm from "@/components/Ui/Form.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";

describe("uiTextField", () => {
  const label = "label";
  const message = "message";
  const mountForm = (rows?: number) => {
    const isValid = ref(true);
    const modelValue = ref("");
    const component = mount(
      defineComponent(
        () => () =>
          h(
            UiForm,
            {
              isValid: isValid.value,
              "onUpdate:isValid": (value: boolean) => {
                isValid.value = value;
              },
            },
            () =>
              h(UiTextField, {
                label,
                modelValue: modelValue.value,
                "onUpdate:modelValue": (value: string) => {
                  modelValue.value = value;
                },
                rows,
                rules: [(value: unknown) => value !== " " || message],
              }),
          ),
      ),
    );
    return { component, isValid };
  };

  test("is named by its visible label", () => {
    expect.hasAssertions();

    const { component } = mountForm();
    const control = component.get("input");

    expect(component.get(`label[for="${control.attributes("id")}"]`).text()).toBe(label);
  });

  test("exposes its control, which a completion attaches to", () => {
    expect.hasAssertions();

    const component = mount(UiTextField, { props: { label, modelValue: "" } });

    expect(component.vm.element).toBe(component.get("input").element);
  });

  test("takes several lines as a textarea", () => {
    expect.hasAssertions();

    const { component } = mountForm(1);

    expect(component.get("textarea").attributes("rows")).toBe("1");
  });

  test("reports a failing rule as it is typed, on the field and to the form", async () => {
    expect.hasAssertions();

    const { component, isValid } = mountForm();
    const control = component.get("input");
    await control.setValue(" ");
    await flushPromises();

    expect(control.attributes("aria-invalid")).toBe("true");
    expect(component.get(`#${control.attributes("aria-errormessage")}`).text()).toBe(message);
    expect(isValid.value).toBe(false);

    await control.setValue("");
    await flushPromises();

    expect(control.attributes("aria-invalid")).toBeUndefined();
    expect(isValid.value).toBe(true);
  });

  test("takes a day as a date field", () => {
    expect.hasAssertions();

    const component = mount(UiTextField, { props: { label, modelValue: "", type: "date" } });

    expect(component.get("input").attributes("type")).toBe("date");
  });

  test("counts what is typed against the most it takes", () => {
    expect.hasAssertions();

    const component = mount(UiTextField, { props: { counter: 1, label, modelValue: " " } });

    expect(component.get("[text-muted]:not(label)").text()).toBe("1 / 1");
  });

  test("keeps a hidden label as its name beside its hint, and takes a number's type", () => {
    expect.hasAssertions();

    const component = mount(UiTextField, {
      props: { isLabelHidden: true, label, modelValue: "", placeholder: label, type: "number" as const },
    });
    const control = component.get("input");
    const labelElement = component.get("label");

    expect(labelElement.classes()).toContain("sr-only");
    expect(labelElement.attributes("for")).toBe(control.attributes("id"));
    expect(control.attributes("placeholder")).toBe(label);
    expect(control.attributes("type")).toBe("number");
  });
});
