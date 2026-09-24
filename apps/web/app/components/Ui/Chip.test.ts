// @vitest-environment happy-dom
import UiChip from "@/components/Ui/Chip.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { UiToken } from "@/models/ui/UiToken";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiChip", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("reads as its words alone, its mark and block hidden from assistive technology", () => {
      expect.hasAssertions();

      const text = "text";
      const component = mount(UiChip, {
        props: { meaning: UiIconMeaning.Filter, token: UiToken.Info },
        slots: { default: text },
      });
      const decorations = component.findAll('[aria-hidden="true"]');

      expect(component.text()).toBe(text);
      expect(decorations).toHaveLength(2);
      expect(decorations[0]?.attributes("style")).toBe("background-color: var(--ui-info);");
    });
  });
});
