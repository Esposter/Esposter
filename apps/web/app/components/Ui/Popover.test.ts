// @vitest-environment happy-dom
import UiPopover from "@/components/Ui/Popover.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiPopover", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";

    afterEach(() => {
      document.body.innerHTML = "";
    });

    test("names its trigger and ties it to the panel it opens", () => {
      expect.hasAssertions();

      const component = mount(UiPopover, { props: { label } });
      const trigger = component.get("button");
      const panel = component.get('[role="dialog"]');

      expect(trigger.attributes("aria-label")).toBe(label);
      expect(trigger.attributes("aria-expanded")).toBe("false");
      expect(trigger.attributes("popovertarget")).toBe(panel.attributes("id"));
      expect(trigger.attributes("aria-controls")).toBe(panel.attributes("id"));
      expect(panel.attributes("aria-label")).toBe(label);
    });

    test("opens from its model, and closes on Escape with focus back on its trigger", async () => {
      expect.hasAssertions();

      const component = mount(UiPopover, { attachTo: document.body, props: { label } });
      await component.setProps({ isOpen: true });
      await flushPromises();
      const trigger = component.get("button");

      expect(trigger.attributes("aria-expanded")).toBe("true");

      await component.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
      await flushPromises();

      expect(trigger.attributes("aria-expanded")).toBe("false");
      expect(component.emitted("update:isOpen")).toStrictEqual([[false]]);
      expect(document.activeElement).toBe(trigger.element);
    });
  });
});
