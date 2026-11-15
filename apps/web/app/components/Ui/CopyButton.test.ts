// @vitest-environment happy-dom
import UiCopyButton from "#src/components/Ui/CopyButton.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
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
