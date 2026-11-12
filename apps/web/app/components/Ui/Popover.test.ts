// @vitest-environment happy-dom
import UiPopover from "@/components/Ui/Popover.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, onTestFinished, test, vi } from "vitest";

describe("uiPopover", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const slots = { trigger: "trigger" };

    test("names its trigger and ties it to the panel it opens", () => {
      expect.hasAssertions();

      const component = mount(UiPopover, { props: { label }, slots });
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

      const component = mount(UiPopover, { attachTo: document.body, props: { label }, slots });
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
      onTestFinished(() => {
        anchor.remove();
      });
      const component = mount(UiPopover, { attachTo: document.body, props: { anchor, isOpen: true, label } });
      await flushPromises();
      await component.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
      await flushPromises();

      expect(component.find("button").exists()).toBe(false);
      expect(anchor.style.getPropertyValue("anchor-name")).not.toBe("");
      expect(document.activeElement).toBe(anchor);
    });

    // A press on another row light-dismisses the panel natively, then the click moves it there, and only then does the
    // Browser report the dismissal: it is the old row's, so it must not close the panel that now hangs off the new row
    test("stays open on the new anchor when the old anchor's dismissal is reported after the move", async () => {
      expect.hasAssertions();

      const firstAnchor = document.createElement("button");
      const secondAnchor = document.createElement("button");
      document.body.append(firstAnchor, secondAnchor);
      onTestFinished(() => {
        firstAnchor.remove();
        secondAnchor.remove();
      });
      const component = mount(UiPopover, {
        attachTo: document.body,
        props: { anchor: firstAnchor, isOpen: true, label },
      });
      await flushPromises();
      const panel = component.get<HTMLElement>('[role="dialog"]').element;
      const showPopover = vi.fn<HTMLElement["showPopover"]>();
      panel.showPopover = showPopover;
      await component.setProps({ anchor: secondAnchor });
      panel.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }));
      await flushPromises();

      expect(component.emitted("update:isOpen")).toBeUndefined();
      expect(showPopover).toHaveBeenCalledTimes(1);
    });

    test("closes when it is moved to another anchor while still shown and then dismissed", async () => {
      expect.hasAssertions();

      const firstAnchor = document.createElement("button");
      const secondAnchor = document.createElement("button");
      document.body.append(firstAnchor, secondAnchor);
      onTestFinished(() => {
        firstAnchor.remove();
        secondAnchor.remove();
      });
      const component = mount(UiPopover, {
        attachTo: document.body,
        props: { anchor: firstAnchor, isOpen: true, label },
      });
      await flushPromises();
      const panel = component.get<HTMLElement>('[role="dialog"]').element;
      const showPopover = vi.fn<HTMLElement["showPopover"]>();
      panel.showPopover = showPopover;
      panel.matches = () => true;
      await component.setProps({ anchor: secondAnchor });
      panel.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }));
      await flushPromises();

      expect(component.emitted("update:isOpen")).toStrictEqual([[false]]);
      expect(showPopover).not.toHaveBeenCalled();
    });

    test("closes when the dismissal of the anchor it hangs off is reported", async () => {
      expect.hasAssertions();

      const anchor = document.createElement("button");
      document.body.append(anchor);
      onTestFinished(() => {
        anchor.remove();
      });
      const component = mount(UiPopover, { attachTo: document.body, props: { anchor, isOpen: true, label } });
      await flushPromises();
      component
        .get('[role="dialog"]')
        .element.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }));
      await flushPromises();

      expect(component.emitted("update:isOpen")).toStrictEqual([[false]]);
    });

    test("draws no trigger of its own while the element it hangs off is not there yet", () => {
      expect.hasAssertions();

      const component = mount(UiPopover, { props: { anchor: undefined, label } });

      expect(component.find("button").exists()).toBe(false);
    });

    // The panel's limit is the body's own, so a list taller than it scrolls inside the panel rather than past it
    test("a long list scrolls inside the popover", () => {
      expect.hasAssertions();

      const component = mount(UiPopover, {
        props: { label },
        slots: { ...slots, default: () => h("ul", [h("li", "a")]) },
      });
      const panel = component.get('[role="dialog"]');
      const body = panel.get("[ui-region-body]");

      expect(body.element.parentElement).toBe(panel.element);
      expect(body.element.contains(component.get("ul").element)).toBe(true);
      expect(body.attributes("max-h")).toBe("[70dvh]");
    });
  });
});
