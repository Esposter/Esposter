// @vitest-environment happy-dom
import UiColorField from "@/components/Ui/ColorField.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

// Happy-dom keeps a named colour as it was written, where a browser computes red in rgb, so the computed colour is
// Stubbed to the rgb a browser gives
const stubComputedRed = () => {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({ color: "rgb(255, 0, 0)" } as CSSStyleDeclaration);
};

describe("uiColorField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    afterEach(() => {
      vi.restoreAllMocks();
    });

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

    test("a held reference shows the colour of the swatch it names in the picker, which holds only a colour", () => {
      expect.hasAssertions();

      const component = mount(UiColorField, {
        props: {
          label: "label",
          modelValue: "var(--color-brand)",
          swatches: [{ name: "color-brand", value: "#ff0000" }],
        },
      });

      expect(component.get<HTMLInputElement>('input[type="color"]').element.value).toBe("#ff0000");
    });

    test("picking a swatch stores a reference to its colour rather than the colour", async () => {
      expect.hasAssertions();

      const component = mount(UiColorField, {
        props: { label: "label", modelValue: "#000000", swatches: [{ name: "color-brand", value: "#ff0000" }] },
      });

      await component.get('button[aria-label="color-brand"]').trigger("click");

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["var(--color-brand)"]]);
    });

    test("a colour that is not hex shows in the picker as the hex of the colour the browser reads it as", async () => {
      expect.hasAssertions();

      stubComputedRed();
      const component = mount(UiColorField, { props: { label: "label", modelValue: "red" } });

      await flushPromises();

      expect(component.get<HTMLInputElement>('input[type="color"]').element.value).toBe("#ff0000");
    });

    test("a held reference to a swatch of a colour that is not hex shows that colour in the picker", async () => {
      expect.hasAssertions();

      stubComputedRed();
      const component = mount(UiColorField, {
        props: { label: "label", modelValue: "var(--color-brand)", swatches: [{ name: "color-brand", value: "red" }] },
      });

      await flushPromises();

      expect(component.get<HTMLInputElement>('input[type="color"]').element.value).toBe("#ff0000");
    });
  });
});
