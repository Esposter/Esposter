// @vitest-environment happy-dom
import UiIconButton from "@/components/Ui/IconButton.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiIconButton", () => {
  test("draws its shortcut in its tooltip, beside its label", () => {
    expect.hasAssertions();

    const label = "label";
    const shortcut = "s";
    const component = mount(UiIconButton, { props: { label, meaning: UiIconMeaning.Save, shortcut } });

    expect(component.get('[role="tooltip"] kbd').text()).toBe("S");
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const disabledReason = "reason";

    // Drawn unavailable without being taken out of reach: it stays focusable and hoverable, so its tooltip can say why
    test("a button given a reason it is unavailable stays focusable and says why in its tooltip", () => {
      expect.hasAssertions();

      const component = mount(UiIconButton, { props: { disabledReason, label, meaning: UiIconMeaning.ArrowDown } });
      const button = component.get("button");

      expect(button.attributes("aria-disabled")).toBe("true");
      expect(button.attributes("disabled")).toBeUndefined();
      expect(component.get('[role="tooltip"]').text()).toBe(`${label}. ${disabledReason}`);
    });
  });
});
