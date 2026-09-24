// @vitest-environment happy-dom
import UiCopyButton from "@/components/Ui/CopyButton.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiCopyButton", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test.each([
      [undefined, "Copy"],
      ["label", "label"],
    ])("is named by its label, or Copy without one", (label, name) => {
      expect.hasAssertions();

      const component = mount(UiCopyButton, { props: { label, source: "" } });

      expect(component.get("button").attributes("aria-label")).toBe(name);
    });
  });
});
