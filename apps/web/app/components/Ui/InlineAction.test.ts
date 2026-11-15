// @vitest-environment happy-dom
import UiInlineAction from "#src/components/Ui/InlineAction.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiInlineAction", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("is a button named by its text that never submits a form around it", () => {
      expect.hasAssertions();

      const text = "text";
      const button = mount(UiInlineAction, { slots: { default: text } }).get("button");

      expect(button.attributes("type")).toBe("button");
      expect(button.text()).toBe(text);
    });
  });
});
