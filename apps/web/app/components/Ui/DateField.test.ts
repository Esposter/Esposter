// @vitest-environment nuxt
import UiDateField from "@/components/Ui/DateField.vue";
import { getDaySelector } from "@/components/Ui/getDaySelector.test";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { getZonedDateTime } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("uiDateField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const epoch = new Date(0);
    const epochZonedDateTime = getZonedDateTime(epoch);
    const nextDay = epochZonedDateTime.toPlainDate().add({ days: 1 });

    test("is a trigger named by its label, described by what it holds, that opens a calendar named the same", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateField, { props: { label, modelValue: epoch } });
      const trigger = component.get("button[aria-describedby]");

      expect(trigger.attributes("aria-label")).toBe(label);
      expect(
        component
          .get(`#${trigger.attributes("aria-describedby")}`)
          .find("time")
          .exists(),
      ).toBe(true);
      expect(component.get('[role="grid"]').attributes("aria-label")).toBe(label);
    });

    test("moves to the day chosen and keeps the time it held", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateField, { props: { isTime: true, label, modelValue: epoch } });
      await component.get(getDaySelector(nextDay.toString())).trigger("click");

      expect(
        component.emitted<[Date]>("update:modelValue")?.map(([date]) => {
          const zonedDateTime = getZonedDateTime(date);
          return [zonedDateTime.toPlainDate().toString(), zonedDateTime.toPlainTime().toString()];
        }),
      ).toStrictEqual([[nextDay.toString(), epochZonedDateTime.toPlainTime().toString()]]);
    });

    test("moves a moment before its earliest onto the earliest", async () => {
      expect.hasAssertions();

      // A minute past the epoch's next day, so its own day at the epoch's time is a minute too early
      const min = new Date(Temporal.Duration.from({ days: 1, minutes: 1 }).total("milliseconds"));
      const component = await mountSuspended(UiDateField, { props: { isTime: true, label, min, modelValue: epoch } });
      const minDate = getZonedDateTime(min).toPlainDate();
      await component.get(getDaySelector(minDate.toString())).trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[min]]);
    });

    test("empties on its clear button only where it may be empty", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiDateField, { props: { label, modelValue: epoch } });

      expect(component.find(`[aria-label="Clear ${label}"]`).exists()).toBe(false);

      await component.setProps({ isClearable: true });
      await component.get(`[aria-label="Clear ${label}"]`).trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[null]]);
    });
  });
});
