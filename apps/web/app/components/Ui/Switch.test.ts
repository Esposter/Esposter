import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
// @vitest-environment happy-dom
import UiSwitch from "@/components/Ui/Switch.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiSwitch", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";

    test("is a named switch that says whether it is on and flips when pressed", async () => {
      expect.hasAssertions();

      const component = mount(UiSwitch, { props: { label, modelValue: false } });
      const control = component.get('[role="switch"]');

      expect(control.attributes("aria-label")).toBe(label);
      expect(control.attributes("aria-checked")).toBe("false");

      await control.trigger("click");
      await flushPromises();

      expect(component.emitted<[boolean]>("update:modelValue")).toStrictEqual([[true]]);
    });
  });
});
