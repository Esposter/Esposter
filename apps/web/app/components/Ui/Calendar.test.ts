// @vitest-environment nuxt
import UiCalendar from "@/components/Ui/Calendar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { TEST_EPOCH_DATE } from "@/services/ui/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

// A day of the grid, found by the ISO date it carries
const getDaySelector = (isoDate: string) => `[data-date="${isoDate}"]`;

describe("uiCalendar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const epoch = TEST_EPOCH_DATE;
    const nextDay = epoch.add({ days: 1 });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    test("is a grid of six weeks named by its label, the chosen day selected and its one tab stop", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { label, modelValue: epoch } });
      const grid = component.get('[role="grid"]');
      const day = component.get(getDaySelector(epoch.toString()));

      expect(grid.attributes("aria-label")).toBe(label);
      expect(grid.findAll("tbody tr")).toHaveLength(6);
      expect(grid.findAll('[role="gridcell"]')).toHaveLength(42);
      expect(day.element.parentElement?.getAttribute("aria-selected")).toBe("true");
      expect(grid.findAll('[tabindex="0"]').map((button) => button.attributes("data-date"))).toStrictEqual([
        epoch.toString(),
      ]);
    });

    test("walks the days by arrow and the months by Page Down, moving focus with it", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, {
        attachTo: document.body,
        props: { label, modelValue: epoch },
      });
      await component.get(getDaySelector(epoch.toString())).trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(document.activeElement).toBe(component.get(getDaySelector(nextDay.toString())).element);

      await component.get(getDaySelector(nextDay.toString())).trigger("keydown", { key: "PageDown" });
      await flushPromises();

      const nextMonthDay = nextDay.add({ months: 1 });

      expect(document.activeElement).toBe(component.get(getDaySelector(nextMonthDay.toString())).element);
    });

    test("chooses a day on click", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { label, modelValue: epoch } });
      await component.get(getDaySelector(nextDay.toString())).trigger("click");

      expect(
        component.emitted<[Temporal.PlainDate]>("update:modelValue")?.map(([date]) => date.toString()),
      ).toStrictEqual([nextDay.toString()]);
    });

    test("says a day before its minimum is disabled and never chooses it", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { label, max: nextDay, min: nextDay } });
      const day = component.get(getDaySelector(epoch.toString()));
      await day.trigger("click");

      expect(day.attributes("aria-disabled")).toBe("true");
      expect(component.emitted("update:modelValue")).toBeUndefined();
    });
  });
});
