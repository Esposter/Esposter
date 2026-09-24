// @vitest-environment happy-dom
import type { VueWrapper } from "@vue/test-utils";

import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, assert, describe, expect, test } from "vitest";

describe("uiConfirmDialog", () => {
  const confirmLabel = "confirmLabel";
  const title = "title";
  // Its label shares the button with the spinner while it is pending, so the button is found by its variant
  const getConfirmButton = (component: VueWrapper) => component.get(`button[data-variant="${UiButtonVariant.Danger}"]`);
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

  afterEach(() => {
    document.body.innerHTML = "";
  });

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

  test("stays open to try again when the answer fails", async () => {
    expect.hasAssertions();

    const { component, onComplete } = await mountDialog();
    onComplete(false);
    await flushPromises();

    expect(component.emitted("update:modelValue")).toBeUndefined();
    expect(getConfirmButton(component).attributes("disabled")).toBeUndefined();
  });
});
