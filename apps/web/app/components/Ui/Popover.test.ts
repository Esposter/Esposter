// @vitest-environment happy-dom
import UiPopover from "@/components/Ui/Popover.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiPopover", () => {
  enableAutoUnmount(afterEach);

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";

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

    test("hangs off an element already on the page in place of a trigger of its own, and hands focus back to it", async () => {
      expect.hasAssertions();

      const anchor = document.createElement("button");
      document.body.append(anchor);
      const component = mount(UiPopover, { attachTo: document.body, props: { anchor, isOpen: true, label } });
      await flushPromises();
      await component.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
      await flushPromises();

      expect(component.find("button").exists()).toBe(false);
      expect(anchor.style.getPropertyValue("anchor-name")).not.toBe("");
      expect(document.activeElement).toBe(anchor);
    });
  });
});
