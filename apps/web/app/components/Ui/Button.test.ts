// @vitest-environment happy-dom
import UiButton from "@/components/Ui/Button.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiButton", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    // The primitive sets a button's type and pressed state for its own groups; a form's submit button and a toggle
    // Outside any group still need the ones they were given
    test("keeps the type and pressed state its call site gives it", () => {
      expect.hasAssertions();

      const component = mount(UiButton, { attrs: { "aria-pressed": "true", type: "submit" } });

      expect(component.get("button").attributes("type")).toBe("submit");
      expect(component.get("button").attributes("aria-pressed")).toBe("true");
    });

    test("is left out of the tab order and inert while disabled", () => {
      expect.hasAssertions();

      const component = mount(UiButton, { props: { disabled: true } });
      const button = component.get("button");

      expect(button.attributes("disabled")).toBe("");
      expect(button.attributes("aria-disabled")).toBe("true");
      expect(button.attributes("tabindex")).toBe("-1");
    });

    test("holds disabled and busy with a spinner while a write it started is pending", () => {
      expect.hasAssertions();

      const component = mount(UiButton, { props: { isPending: true } });
      const button = component.get("button");

      expect(button.attributes("disabled")).toBe("");
      expect(button.attributes("aria-busy")).toBe("true");
      expect(component.findComponent({ name: "UiSpinner" }).exists()).toBe(true);
    });
  });
});
