// @vitest-environment happy-dom
import UiDialog from "@/components/Ui/Dialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiStyles } from "@/models/ui/UiStyle";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiDialog", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const title = "title";

    test("opens holding focus itself, so no control reads as chosen", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("button", { type: "button" }) },
      });
      await flushPromises();

      expect(document.activeElement).toBe(component.get("dialog").element);
    });

    test("leaves focus to a control that asks for it", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("button", { autofocus: true, type: "button" }) },
      });
      await flushPromises();

      expect(document.activeElement).not.toBe(component.get("dialog").element);
    });

    test("stands over the whole page while an expandable dialog is expanded", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { isExpandable: true, modelValue: true, placement: UiDialogPlacement.Middle, title },
      });
      await flushPromises();
      await component.get('[aria-label="Full screen"]').trigger("click");

      expect(component.emitted("update:isExpanded")).toStrictEqual([[true]]);

      await component.setProps({ isExpanded: true });

      expect(component.get("dialog").attributes("data-placement")).toBe(UiDialogPlacement.FullScreen);
      expect(component.get('[aria-label="Full screen"]').attributes("aria-pressed")).toBe("true");
    });

    // An editor's close is the title bar's, so the dialog holds open while its caller asks about unsaved changes
    test("stays open when a caller refuses the close its close button asks for", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, "onUpdate:modelValue": noop, title },
      });
      await flushPromises();
      await component.get('[aria-label="Close"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
      expect(component.get<HTMLDialogElement>("dialog").element.open).toBe(true);
    });

    // An editor with unsaved changes answers a close by asking first, so the dialog holds open until its model moves
    test("stays open when a caller refuses the close Escape asks for", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        // A listener that leaves the model where it is is the caller refusing
        props: { modelValue: true, "onUpdate:modelValue": noop, title },
      });
      await flushPromises();
      const dialog = component.get<HTMLDialogElement>("dialog").element;
      const cancelEvent = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(cancelEvent);
      await flushPromises();

      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
      expect(dialog.open).toBe(true);
    });

    // The body is the one region the frame's flex column scrolls, so a list taller than the frame is held inside it.
    // jsdom measures no layout, so the overflow itself is proven in a driven browser; this pins the structure it needs
    test("A long list scrolls inside the body", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("ul", [h("li", "a")]) },
      });
      await flushPromises();
      const body = component.get("[ui-region-body]");

      expect(body.element.parentElement).toBe(component.get("section").element);
      expect(body.element.contains(component.get("ul").element)).toBe(true);
    });

    // A body draws no height of its own, so the frame sizes it to its content and only its maximum limits it. Whether a
    // Short one shows a scrollbar is the layout the browser decides, which the driven browser run proves
    test("A short body does not scroll", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("p", "a") },
      });
      await flushPromises();

      expect(component.get("[ui-region-body]").classes()).toStrictEqual([]);
    });

    test("A bare body keeps the scroll without the padding", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { isBodyBare: true, modelValue: true, title },
        slots: { default: () => h("ul", [h("li", "a")]) },
      });
      await flushPromises();

      expect(component.get("[ui-region-body]").classes()).toStrictEqual(["p-0"]);
    });

    // The footer is drawn after the body rather than inside it, so a long body scrolls above the actions and not over them
    test("The footer stays in view", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("p", "a"), footer: () => h("button", { type: "button" }) },
      });
      await flushPromises();
      const footer = component.get("footer");

      expect(footer.element.parentElement).toBe(component.get("section").element);
      expect(component.get("[ui-region-body]").element.nextElementSibling).toBe(footer.element);
    });

    // The body is there either way, so the footer's absence is what is checked rather than a dialog with no body at all
    test("No footer content draws no region", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("p", "a") },
      });
      await flushPromises();

      expect(component.find("[ui-region-body]").exists()).toBe(true);
      expect(component.find("footer").exists()).toBe(false);
    });
  });
});
