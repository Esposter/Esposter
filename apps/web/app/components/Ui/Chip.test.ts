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
      expect(decorations.map((decoration) => decoration.attributes("style"))).toStrictEqual([
        "background-color: var(--ui-info);",
        undefined,
      ]);
    });

    test("holds a remove button named by its remove label, and none without one", async () => {
      expect.hasAssertions();

      const removeLabel = "removeLabel";
      const component = mount(UiChip, { props: { removeLabel }, slots: { default: "" } });
      await component.get(`button[aria-label="${removeLabel}"]`).trigger("click");

      expect(component.emitted("remove")).toStrictEqual([[]]);

      await component.setProps({ removeLabel: undefined });

      expect(component.find("button").exists()).toBe(false);
    });
  });
});
