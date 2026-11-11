// @vitest-environment happy-dom
import UiFieldLabel from "@/components/Ui/FieldLabel.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiFieldLabel", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";

    test("a required label draws its mark", () => {
      expect.hasAssertions();

      const component = mount(UiFieldLabel, { props: { isRequired: true, label } });

      expect(component.get('[aria-hidden="true"]').text()).toBe("*");
      expect(component.text()).toBe(`${label} * required`);
    });

    test("an optional label draws none", () => {
      expect.hasAssertions();

      const component = mount(UiFieldLabel, { props: { label } });

      expect(component.find('[aria-hidden="true"]').exists()).toBe(false);
      expect(component.text()).toBe(label);
    });
  });
});
