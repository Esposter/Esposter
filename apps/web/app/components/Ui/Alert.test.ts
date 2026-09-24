// @vitest-environment happy-dom
import UiAlert from "@/components/Ui/Alert.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiAlert", () => {
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
