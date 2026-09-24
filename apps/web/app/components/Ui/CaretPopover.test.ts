// @vitest-environment happy-dom
import UiCaretPopover from "@/components/Ui/CaretPopover.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiCaretPopover", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const rect = new DOMRect(1, 1, 1, 1);

    test("stands a box the caret's size at its place, and holds its content in a panel nothing light-dismisses", () => {
      expect.hasAssertions();

      const component = mount(UiCaretPopover, { props: { rect }, slots: { default: "content" } });
      const anchor = component.get('[aria-hidden="true"]');
      const panel = component.get('[popover="manual"]');

      expect(anchor.attributes("style")).toContain("left: 1px");
      expect(anchor.attributes("style")).toContain("top: 1px");
      expect(panel.text()).toBe("content");
    });
  });
});
