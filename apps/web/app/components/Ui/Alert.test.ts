// @vitest-environment happy-dom
import UiAlert from "@/components/Ui/Alert.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiAlert", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const text = "text";

    test.each([
      ["error", "alert", "assertive"],
      ["warning", "status", "polite"],
    ] as const)("reads a %s out as a live %s region", (status, role, live) => {
      expect.hasAssertions();

      const component = mount(UiAlert, { props: { status }, slots: { default: text } });
      const alert = component.get(`[role="${role}"]`);

      expect(alert.attributes("aria-live")).toBe(live);
      expect(alert.text()).toBe(text);
    });
  });
});
