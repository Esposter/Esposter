// @vitest-environment happy-dom
import UiRequiredMark from "@/components/Ui/RequiredMark.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiRequiredMark", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("draws a star that speech skips, and says required once", () => {
      expect.hasAssertions();

      const component = mount(UiRequiredMark);

      expect(component.get('[aria-hidden="true"]').text()).toBe("*");
      expect(component.text()).toBe("* required");
    });

    test("draws the star alone where the control says required itself", () => {
      expect.hasAssertions();

      const component = mount(UiRequiredMark, { props: { isSilent: true } });

      expect(component.text()).toBe("*");
    });
  });
});
