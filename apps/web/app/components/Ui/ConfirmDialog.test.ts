// @vitest-environment happy-dom
import type { VueWrapper } from "@vue/test-utils";

import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiStyles } from "@/models/ui/UiStyle";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, assert, describe, expect, test } from "vitest";

// Its label shares the button with the spinner while it is pending, so the button is found by its variant
const getConfirmButton = (component: VueWrapper) => component.get(`button[data-variant="${UiButtonVariant.Danger}"]`);

describe("uiConfirmDialog", () => {
  enableAutoUnmount(afterEach);

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const confirmLabel = "confirmLabel";
    const title = "title";
    const mountDialog = async () => {
      const component = mount(UiConfirmDialog, {
        attachTo: document.body,
        props: { confirmLabel, modelValue: true, title },
      });
      await flushPromises();
      await getConfirmButton(component).trigger("click");
      const onComplete = component.emitted<[(isSuccessful?: boolean) => void]>("confirm")?.[0]?.[0];
      assert.exists(onComplete);
      return { component, onComplete };
    };

    test("is an alert dialog that opens onto Cancel", async () => {
      expect.hasAssertions();

      const component = mount(UiConfirmDialog, {
        attachTo: document.body,
        props: { confirmLabel, modelValue: true, title },
      });
      await flushPromises();

      expect(component.get("dialog").attributes("role")).toBe("alertdialog");
      // The browser's dialog focusing steps take the autofocus element, which happy-dom does not run
      expect(component.get("button[autofocus]").text()).toBe("Cancel");
    });

    test("holds its answer pending until the caller completes it, then closes", async () => {
      expect.hasAssertions();

      const { component, onComplete } = await mountDialog();

      expect(getConfirmButton(component).attributes("disabled")).toBe("");

      onComplete();
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
    });

    test("holds a guarded answer until the name is typed", async () => {
      expect.hasAssertions();

      const confirmName = "confirmName";
      const component = mount(UiConfirmDialog, {
        attachTo: document.body,
        props: { confirmLabel, confirmName, modelValue: true, title },
      });
      await flushPromises();

      expect(getConfirmButton(component).attributes("disabled")).toBe("");

      await component.get("input").setValue(confirmName);

      expect(getConfirmButton(component).attributes("disabled")).toBeUndefined();
    });

    test("stays open to try again when the answer fails", async () => {
      expect.hasAssertions();

      const { component, onComplete } = await mountDialog();
      onComplete(false);
      await flushPromises();

      expect(component.emitted("update:modelValue")).toBeUndefined();
      expect(getConfirmButton(component).attributes("disabled")).toBeUndefined();
    });
  });
});
