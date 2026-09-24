// @vitest-environment happy-dom
import UiMeter from "@/components/Ui/Meter.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { METER_BLOCK_COUNT } from "@/services/ui/constants";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiMeter", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const valueText = "valueText";

    test("is a named meter out of a hundred, read out in words", () => {
      expect.hasAssertions();

      const component = mount(UiMeter, { props: { high: 100, label, low: 100, value: 0, valueText } });

      expect(component.attributes("role")).toBe("meter");
      expect(component.attributes("aria-label")).toBe(label);
      expect(component.attributes("aria-valuemin")).toBe("0");
      expect(component.attributes("aria-valuemax")).toBe("100");
      expect(component.attributes("aria-valuenow")).toBe("0");
      expect(component.attributes("aria-valuetext")).toBe(valueText);
      expect(component.findAll("[data-filled]")).toHaveLength(0);
      expect(component.attributes("data-level")).toBeUndefined();
    });

    test.each([
      [50, "low"],
      [100, "high"],
    ])("fills a block a tenth at a time and, at %i, reaches its %s mark", (value, level) => {
      expect.hasAssertions();

      const component = mount(UiMeter, { props: { high: 100, label, low: 50, value, valueText } });

      expect(component.findAll("[data-filled]")).toHaveLength((value / 100) * METER_BLOCK_COUNT);
      expect(component.attributes("data-level")).toBe(level);
    });
  });
});
