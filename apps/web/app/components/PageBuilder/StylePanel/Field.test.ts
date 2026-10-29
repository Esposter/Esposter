// @vitest-environment happy-dom
import UiStyleField from "@/components/PageBuilder/StylePanel/Field.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderStylePanelField", () => {
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

    test("the arrows step a decimal length without float noise", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, { props: { label: "Width", modelValue: "0.14rem", property: "width" } });

      await component.get("input").trigger("keydown", { key: "ArrowUp" });

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["1.14rem"]]);
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

    // Clearing a keyword leaves a draft that is a length, which would swap the text field for the number field
    // And drop the caret, so the text field holds until focus leaves it
    test("a keyword cleared to empty keeps its text field focused", async () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, {
        attachTo: document.body,
        props: { label: "Width", modelValue: "auto", property: "width" },
      });
      const input = component.get("input");
      (input.element as HTMLInputElement).focus();

      await input.setValue("");

      expect(document.activeElement).toBe(input.element);
      component.unmount();
    });

    test("a border's width offers every length unit but the percentage", () => {
      expect.hasAssertions();

      vi.stubGlobal("CSS", { supports: () => true });
      const component = mount(UiStyleField, {
        props: { label: "Border width", modelValue: "2px", property: "border-width" },
      });

      expect(component.findComponent({ name: "UiSelect" }).props("items")).toStrictEqual(
        ["px", "rem", "em", "vw", "vh"].map((lengthUnit) => ({ title: lengthUnit, value: lengthUnit })),
      );
    });
  });
});
