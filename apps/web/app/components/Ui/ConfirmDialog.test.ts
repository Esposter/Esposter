// @vitest-environment happy-dom
import type { VueWrapper } from "@vue/test-utils";

import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiStyles } from "@/models/ui/UiStyle";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Its label shares the button with the spinner while it is pending, so the button is found by its variant
const getConfirmButton = (component: VueWrapper) => component.get(`button[data-variant="${UiButtonVariant.Danger}"]`);

describe("uiConfirmDialog", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const confirmLabel = "confirmLabel";
    const title = "title";
    const mountDialog = async (props: Partial<InstanceType<typeof UiConfirmDialog>["$props"]> = {}) => {
      const component = mount(UiConfirmDialog, {
        attachTo: document.body,
        props: { confirm: noop, confirmLabel, modelValue: true, title, ...props },
      });
      await flushPromises();
      return component;
    };
    // An answer the test settles by hand, so what the dialog shows while it is out can be read
    const mountAnswering = async (props: Partial<InstanceType<typeof UiConfirmDialog>["$props"]> = {}) => {
      const { promise, resolve } = Promise.withResolvers<boolean | undefined>();
      const confirm = vi.fn<() => Promise<boolean | undefined>>(() => promise);
      const component = await mountDialog({ confirm, ...props });
      await getConfirmButton(component).trigger("click");
      return { component, confirm, resolve };
    };

    test("is an alert dialog that opens onto Cancel", async () => {
      expect.hasAssertions();

      const component = await mountDialog();

      expect(component.get("dialog").attributes("role")).toBe("alertdialog");
      // The browser's dialog focusing steps take the autofocus element, which happy-dom does not run
      expect(component.get("button[autofocus]").text()).toBe("Cancel");
    });

    test("holds its answer pending until it settles, then closes", async () => {
      expect.hasAssertions();

      const { component, resolve } = await mountAnswering();

      expect(getConfirmButton(component).attributes("disabled")).toBe("");

      resolve(undefined);
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
    });

    test("closes an optimistic answer before it settles", async () => {
      expect.hasAssertions();

      const { component, confirm } = await mountAnswering({ isOptimistic: true });

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
    });

    test("holds a guarded answer until the name is typed", async () => {
      expect.hasAssertions();

      const confirmName = "confirmName";
      const component = await mountDialog({ confirmName });

      expect(getConfirmButton(component).attributes("disabled")).toBe("");

      await component.get("input").setValue(confirmName);

      expect(getConfirmButton(component).attributes("disabled")).toBeUndefined();
    });

    test("stays open to try again when the answer fails", async () => {
      expect.hasAssertions();

      const { component, resolve } = await mountAnswering();
      resolve(false);
      await flushPromises();

      expect(component.emitted("update:modelValue")).toBeUndefined();
      expect(getConfirmButton(component).attributes("disabled")).toBeUndefined();
    });
  });
});
