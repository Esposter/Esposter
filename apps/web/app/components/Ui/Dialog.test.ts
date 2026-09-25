// @vitest-environment happy-dom
import UiDialog from "@/components/Ui/Dialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { noop } from "@esposter/shared";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiDialog", () => {
  enableAutoUnmount(afterEach);

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
  });
});
