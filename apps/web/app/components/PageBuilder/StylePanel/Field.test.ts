// @vitest-environment happy-dom
import UiStyleField from "@/components/PageBuilder/StylePanel/Field.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("styleField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test("a supported value is saved", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, { props: { label: "Color", modelValue: "", property: "color" } });

      await component.get("input").setValue("red");

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["red"]]);
    });

    test("an unsupported style value stays in its field unsaved", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => false });
      const component = mount(UiStyleField, { props: { label: "Color", modelValue: "red", property: "color" } });

      await component.get("input").setValue("notacolour");

      expect(component.emitted<[string]>("update:modelValue")).toBeUndefined();
      expect((component.get("input").element as HTMLInputElement).value).toBe("notacolour");
    });

    test("the arrows step a length by one and Shift by ten, keeping its unit", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, { props: { label: "Width", modelValue: "10rem", property: "width" } });

      await component.get("input").trigger("keydown", { key: "ArrowUp" });
      await component.get("input").trigger("keydown", { key: "ArrowDown", shiftKey: true });

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["11rem"], ["1rem"]]);
    });

    test("a length with no number has its unit select disabled until a number is typed", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, { props: { label: "Width", modelValue: "", property: "width" } });

      expect(component.get('[role="combobox"]').attributes("aria-disabled")).toBe("true");

      await component.get("input").setValue("2");

      expect(component.get('[role="combobox"]').attributes("aria-disabled")).toBe("false");
    });

    test("a cleared number keeps the length's unit for the next number", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, { props: { label: "Width", modelValue: "10rem", property: "width" } });

      await component.get("input").setValue("");
      await component.get("input").setValue("5");

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([[""], ["5rem"]]);
    });

    test("a style value with a brace is refused", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, { props: { label: "Color", modelValue: "red", property: "color" } });

      await component.get("input").setValue("red} body { display: none");

      expect(component.emitted<[string]>("update:modelValue")).toBeUndefined();
      expect((component.get("input").element as HTMLInputElement).value).toBe("red} body { display: none");
    });
  });
});
