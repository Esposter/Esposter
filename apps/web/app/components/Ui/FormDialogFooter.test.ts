// @vitest-environment happy-dom
import type { VueWrapper } from "@vue/test-utils";

import UiFormDialogFooter from "@/components/Ui/FormDialogFooter.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, onTestFinished, test, vi } from "vitest";

const mountFooter = (props: Partial<InstanceType<typeof UiFormDialogFooter>["$props"]> = {}) =>
  mount(UiFormDialogFooter, { props: { isValid: true, modelValue: true, ...props } });
const getSaveButton = (component: VueWrapper) => component.get('button[type="submit"]');

describe("uiFormDialogFooter", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("closes the dialog on Cancel", async () => {
      expect.hasAssertions();

      const component = mountFooter();
      await component.get("button").trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
    });

    test("disables Save while the form is invalid", () => {
      expect.hasAssertions();

      const component = mountFooter({ isValid: false });

      expect(getSaveButton(component).attributes("disabled")).toBe("");
    });

    // The form sits in the dialog's body and this footer beside it, so Save names the form by its id rather than
    // Sitting inside it
    test("The footer's submit submits the body's form", () => {
      expect.hasAssertions();

      const formId = crypto.randomUUID();
      const form = document.createElement("form");
      form.id = formId;
      document.body.append(form);
      onTestFinished(() => {
        form.remove();
      });
      const submit = vi.fn<(event: Event) => void>((event) => {
        event.preventDefault();
      });
      form.addEventListener("submit", submit);
      const component = mount(UiFormDialogFooter, {
        attachTo: document.body,
        props: { formId, isValid: true, modelValue: true },
      });

      component.get<HTMLButtonElement>('button[type="submit"]').element.click();

      expect(submit).toHaveBeenCalledTimes(1);
    });

    // Enter in a field submits through the form's default button, the first submit button tied to the form in tree
    // Order. Only the footer's Save is tied to it, so it is the default, and implicit submission is the browser's
    test("Enter in a field submits the form", () => {
      expect.hasAssertions();

      const formId = crypto.randomUUID();
      const form = document.createElement("form");
      form.id = formId;
      form.append(document.createElement("input"));
      document.body.append(form);
      onTestFinished(() => {
        form.remove();
      });
      const component = mount(UiFormDialogFooter, {
        attachTo: document.body,
        props: { formId, isValid: true, modelValue: true },
      });
      const defaultButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button[type="submit"]')).find(
        ({ form: ownerForm }) => ownerForm === form,
      );

      expect(defaultButton).toBe(component.get<HTMLButtonElement>('button[type="submit"]').element);
    });
  });
});
