// @vitest-environment happy-dom
import UiResizeHandle from "@/components/Ui/ResizeHandle.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { RESIZE_HANDLE_KEYBOARD_STEP } from "@/services/ui/constants";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiResizeHandle", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const min = 0;
    const max = RESIZE_HANDLE_KEYBOARD_STEP * 2;
    const modelValue = RESIZE_HANDLE_KEYBOARD_STEP;

    test("is a vertical separator named by its label that says the width and its range", () => {
      expect.hasAssertions();

      const separator = mount(UiResizeHandle, { props: { label, max, min, modelValue } }).get('[role="separator"]');

      expect(separator.attributes("aria-label")).toBe(label);
      expect(separator.attributes("aria-orientation")).toBe("vertical");
      expect(separator.attributes("aria-valuemax")).toBe(String(max));
      expect(separator.attributes("aria-valuemin")).toBe(String(min));
      expect(separator.attributes("aria-valuenow")).toBe(String(modelValue));
      expect(separator.attributes("tabindex")).toBe("0");
    });

    test.each([
      ["ArrowRight", false, max],
      ["ArrowLeft", false, min],
      ["ArrowRight", true, min],
      ["End", false, max],
      ["Home", false, min],
    ])("steps on %s, reversed %s, to %d", async (key, isReversed, expectedWidth) => {
      expect.hasAssertions();

      const component = mount(UiResizeHandle, {
        props: { isReversed: isReversed || undefined, label, max, min, modelValue },
      });
      await component.get('[role="separator"]').trigger("keydown", { key });

      expect(component.emitted("update:modelValue")).toStrictEqual([[expectedWidth]]);
    });

    test("follows a drag, held to its range", async () => {
      expect.hasAssertions();

      const component = mount(UiResizeHandle, { props: { label, max, min, modelValue } });
      const separator = component.get('[role="separator"]');
      await separator.trigger("pointerdown", { clientX: 0 });
      await separator.trigger("pointermove", { clientX: max });

      expect(component.emitted("update:modelValue")).toStrictEqual([[max]]);
    });

    test("follows a drag in whole pixels", async () => {
      expect.hasAssertions();

      const component = mount(UiResizeHandle, { props: { label, max, min, modelValue } });
      const separator = component.get('[role="separator"]');
      await separator.trigger("pointerdown", { clientX: 0 });
      await separator.trigger("pointermove", { clientX: 0.5 });

      expect(component.emitted("update:modelValue")).toStrictEqual([[modelValue + 1]]);
    });

    test("follows only the pointer that started the drag", async () => {
      expect.hasAssertions();

      const component = mount(UiResizeHandle, { props: { label, max, min, modelValue } });
      const separator = component.get('[role="separator"]');
      await separator.trigger("pointerdown", { clientX: 0, pointerId: 1 });
      await separator.trigger("pointerdown", { clientX: max, pointerId: 2 });
      await separator.trigger("pointermove", { clientX: min, pointerId: 2 });
      await separator.trigger("pointerup", { pointerId: 2 });
      await separator.trigger("pointermove", { clientX: max, pointerId: 1 });

      expect(component.emitted("update:modelValue")).toStrictEqual([[max]]);
    });
  });
});
