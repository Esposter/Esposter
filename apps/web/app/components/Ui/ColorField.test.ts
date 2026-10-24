// @vitest-environment happy-dom
import UiColorField from "@/components/Ui/ColorField.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiColorField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("is a colour input named by its label, showing the value it holds", async () => {
      expect.hasAssertions();

      const label = "label";
      const component = mount(UiColorField, { props: { label, modelValue: "#000000" } });
      const control = component.get('input[type="color"]');

      expect(component.get(`label[for="${control.attributes("id")}"]`).text()).toBe(label);
      expect(component.get("code").text()).toBe("#000000");

      await control.setValue("#ffffff");

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["#ffffff"]]);
    });

    test("picking a swatch stores a reference to its colour rather than the colour", async () => {
      expect.hasAssertions();

      const component = mount(UiColorField, {
        props: { label: "label", modelValue: "#000000", swatches: [{ name: "color-brand", value: "#ff0000" }] },
      });

      await component.get('button[aria-label="color-brand"]').trigger("click");

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["var(--color-brand)"]]);
    });
  });
});
