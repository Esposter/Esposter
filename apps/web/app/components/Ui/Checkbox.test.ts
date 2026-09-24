// @vitest-environment happy-dom
import UiCheckbox from "@/components/Ui/Checkbox.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiCheckbox", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";

    test("is a named checkbox that says whether it is checked and toggles when pressed", async () => {
      expect.hasAssertions();

      const component = mount(UiCheckbox, {
        props: {
          label,
          modelValue: false,
          "onUpdate:modelValue": (modelValue: boolean) => component.setProps({ modelValue }),
        },
      });
      const checkbox = component.get('[role="checkbox"]');

      expect(checkbox.attributes("aria-label")).toBe(label);
      expect(checkbox.attributes("aria-checked")).toBe("false");

      await checkbox.trigger("click");

      expect(component.props("modelValue")).toBe(true);
      expect(checkbox.attributes("aria-checked")).toBe("true");
    });

    test("says it is mixed while part of what it stands for is checked", () => {
      expect.hasAssertions();

      const component = mount(UiCheckbox, { props: { isMixed: true, label, modelValue: false } });

      expect(component.get('[role="checkbox"]').attributes("aria-checked")).toBe("mixed");
    });
  });
});
