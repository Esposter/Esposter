// @vitest-environment nuxt
import UiDateRangeField from "@/components/Ui/DateRangeField.vue";
import { getDaySelector } from "@/components/Ui/getDaySelector.test";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { TEST_EPOCH_DATE } from "@/services/ui/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("uiDateRangeField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const epoch = TEST_EPOCH_DATE;
    const nextDay = epoch.add({ days: 1 });
    const nextDayIsoString = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString();

    test("is a trigger named by its label, described by the two days it holds, that opens a range calendar named the same", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateRangeField, { props: { from: epoch, label, to: nextDay } });
      const trigger = component.get("button[aria-describedby]");

      expect(trigger.attributes("aria-label")).toBe(label);
      expect(
        component
          .get(`#${trigger.attributes("aria-describedby")}`)
          .findAll("time")
          .map((time) => time.attributes("datetime")),
      ).toStrictEqual([new Date(0).toISOString(), nextDayIsoString]);
      expect(component.get('[role="grid"]').attributes("aria-label")).toBe(label);
      expect(component.get('[role="grid"]').attributes("aria-multiselectable")).toBe("true");
    });

    test("ends the range on the second day pressed", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateRangeField, { props: { from: epoch, label } });
      await component.get(getDaySelector(nextDay.toString())).trigger("click");

      expect(component.emitted<[Temporal.PlainDate]>("update:to")?.map(([date]) => date.toString())).toStrictEqual([
        nextDay.toString(),
      ]);
    });

    test("empties both ends on its one clear button, drawn only while it holds a day", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateRangeField, { props: { label } });

      expect(component.find(`[aria-label="Clear ${label}"]`).exists()).toBe(false);

      await component.setProps({ from: epoch, to: nextDay });
      await component.get(`[aria-label="Clear ${label}"]`).trigger("click");

      expect(component.emitted("update:from")).toStrictEqual([[undefined]]);
      expect(component.emitted("update:to")).toStrictEqual([[undefined]]);
    });

    // A caller can bound the range on one side only, and a field holding its end is not empty
    test("shows and clears a range that has only its end", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateRangeField, { props: { label, to: nextDay } });
      const trigger = component.get("button[aria-describedby]");

      expect(
        component
          .get(`#${trigger.attributes("aria-describedby")}`)
          .findAll("time")
          .map((time) => time.attributes("datetime")),
      ).toStrictEqual([nextDayIsoString]);
      expect(component.find(`[aria-label="Clear ${label}"]`).exists()).toBe(true);
    });
  });
});
