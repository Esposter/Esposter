// @vitest-environment happy-dom
import UiDialog from "@/components/Ui/Dialog.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiDialog", () => {
  const title = "title";

  afterEach(() => {
    document.body.innerHTML = "";
  });

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
});
