import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
// @vitest-environment happy-dom
import UiToast from "@/components/Ui/Toast/Index.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("uiToast", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const durationMs = 1;

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("announces an error at once and anything else politely through its stack", () => {
      expect.hasAssertions();

      const errorToast = mount(UiToast, { props: { status: "error" } });
      const successToast = mount(UiToast, { props: { status: "success" } });

      expect(errorToast.attributes("role")).toBe("alert");
      expect(successToast.attributes("role")).toBeUndefined();
    });

    test("closes itself once its time is up, but not while the pointer is over it", async () => {
      expect.hasAssertions();

      const component = mount(UiToast, { props: { durationMs, status: "success" } });
      await component.trigger("pointerenter");
      vi.advanceTimersByTime(durationMs);

      expect(component.emitted("close")).toBeUndefined();

      await component.trigger("pointerleave");
      vi.advanceTimersByTime(durationMs);

      expect(component.emitted("close")).toStrictEqual([[]]);
    });

    test("stays while focus is inside it after the pointer leaves", async () => {
      expect.hasAssertions();

      const component = mount(UiToast, { props: { durationMs, status: "success" } });
      await component.trigger("focusin");
      await component.trigger("pointerenter");
      await component.trigger("pointerleave");
      vi.advanceTimersByTime(durationMs);

      expect(component.emitted("close")).toBeUndefined();

      await component.trigger("focusout");
      vi.advanceTimersByTime(durationMs);

      expect(component.emitted("close")).toStrictEqual([[]]);
    });

    test("offers a labelled dismissal only when it is dismissible", async () => {
      expect.hasAssertions();

      const component = mount(UiToast, { props: { status: "success" } });

      expect(component.find('[aria-label="Dismiss"]').exists()).toBe(false);

      await component.setProps({ isDismissible: true });
      await component.get('[aria-label="Dismiss"]').trigger("click");

      expect(component.emitted("close")).toStrictEqual([[]]);
    });
  });
});
