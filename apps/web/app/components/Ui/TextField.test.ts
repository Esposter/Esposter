// @vitest-environment happy-dom
import UiForm from "@/components/Ui/Form.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiTextField from "@/components/Ui/TextField.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";

describe("uiTextField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

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

    test("is described by its hint, which gives way to a failing rule's message", async () => {
      expect.hasAssertions();

      const hint = "hint";
      const component = mount(UiTextField, {
        attachTo: document.body,
        props: { hint, label, modelValue: "", rules: [(value: unknown) => value !== " " || message] },
      });
      await flushPromises();
      const control = component.get("input");

      expect(component.get(`#${control.attributes("aria-describedby")}`).text()).toBe(hint);

      await control.setValue(" ");
      await flushPromises();

      expect(component.text()).not.toContain(hint);
      expect(component.get(`#${control.attributes("aria-errormessage")}`).text()).toBe(message);
    });

    test("takes a day as a date field", () => {
      expect.hasAssertions();

      const component = mount(UiTextField, { props: { label, modelValue: "", type: UiTextFieldType.Date } });

      expect(component.get("input").attributes("type")).toBe(UiTextFieldType.Date);
    });

    test("counts what is typed against the most it takes", () => {
      expect.hasAssertions();

      const component = mount(UiTextField, { props: { counter: 1, label, modelValue: " " } });

      expect(component.get("[text-muted]:not(label)").text()).toBe("1 / 1");
    });

    test("stops typing at its most characters, counted under it", () => {
      expect.hasAssertions();

      const component = mount(UiTextField, { props: { label, maxlength: 1, modelValue: " " } });

      expect(component.get("input").attributes("maxlength")).toBe("1");
      expect(component.get("[text-muted]:not(label)").text()).toBe("1 / 1");
    });

    test("takes no input while disabled", () => {
      expect.hasAssertions();

      const component = mount(UiTextField, { props: { isDisabled: true, label, modelValue: "" } });

      expect(component.get("input").attributes("disabled")).toBe("");
    });

    test("keeps a hidden label as its name beside its hint, and takes a number's type", () => {
      expect.hasAssertions();

      const component = mount(UiTextField, {
        props: { isLabelHidden: true, label, modelValue: "", placeholder: label, type: UiTextFieldType.Number },
      });
      const control = component.get("input");
      const labelElement = component.get("label");

      expect(labelElement.classes()).toContain("sr-only");
      expect(labelElement.attributes("for")).toBe(control.attributes("id"));
      expect(control.attributes("placeholder")).toBe(label);
      expect(control.attributes("type")).toBe("number");
    });

    test("names a search by its label, and clears it from inside the field once it holds text", async () => {
      expect.hasAssertions();

      const component = mount(UiTextField, {
        props: {
          label,
          modelValue: " ",
          "onUpdate:modelValue": (value: string) => component.setProps({ modelValue: value }),
          type: UiTextFieldType.Search,
        },
      });
      const field = component.get("input");

      expect(field.attributes("placeholder")).toBe(label);
      expect(component.get(`label[for="${field.attributes("id")}"]`).text()).toBe(label);

      await component.get('[aria-label="Clear search"]').trigger("click");

      expect(component.props("modelValue")).toBe("");
      expect(component.find('[aria-label="Clear search"]').exists()).toBe(false);
    });
  });
});
