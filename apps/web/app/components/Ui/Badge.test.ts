// @vitest-environment happy-dom
import UiBadge from "@/components/Ui/Badge.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiBadge", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("hides an unlabelled count from assistive technology", () => {
      expect.hasAssertions();

      const component = mount(UiBadge, { props: { count: 0 } });

      expect(component.text()).toBe("0");
      expect(component.attributes("aria-hidden")).toBe("true");
      expect(component.attributes("role")).toBeUndefined();
    });

    test("names a labelled count as an image", () => {
      expect.hasAssertions();

      const label = "label";
      const component = mount(UiBadge, { props: { count: 0, label } });

      expect(component.attributes("aria-hidden")).toBeUndefined();
      expect(component.attributes("aria-label")).toBe(label);
      expect(component.attributes("role")).toBe("img");
    });
  });
});
