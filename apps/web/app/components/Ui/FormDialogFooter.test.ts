// @vitest-environment happy-dom
import type { VueWrapper } from "@vue/test-utils";

import UiFormDialogFooter from "@/components/Ui/FormDialogFooter.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

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
  });
});
