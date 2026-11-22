// @vitest-environment nuxt
import UiCalendar from "#src/components/Ui/Calendar.vue";
import { getDaySelector } from "#src/components/Ui/getDaySelector.test";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
import { CALENDAR_CLOCK_INTERVAL_MS } from "#src/services/ui/constants";
import { TEST_EPOCH_DATE } from "#src/services/ui/constants.test";
import { getZonedDateTime } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("uiCalendar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);
    afterEach(() => {
      vi.useRealTimers();
    });

    const label = "label";
    const epoch = TEST_EPOCH_DATE;
    const nextDay = epoch.add({ days: 1 });

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

    test("keeps the month a reader paged to when its day is set again as a new value", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { label, modelValue: epoch } });
      await component.get('[aria-label="Next month"]').trigger("click");
      await component.setProps({ modelValue: Temporal.PlainDate.from(epoch.toString()) });

      expect(component.findAll('[data-date][tabindex="0"]').map((day) => day.attributes("data-date"))).toStrictEqual([
        epoch.add({ months: 1 }).toString(),
      ]);
    });

    test("reports a range through aria-selected on every day from its start to its end", async () => {
      expect.hasAssertions();

      const to = nextDay.add({ days: 1 });
      const component = await mountSuspended(UiCalendar, { props: { from: epoch, isRange: true, label, to } });

      expect(component.get('[role="grid"]').attributes("aria-multiselectable")).toBe("true");
      expect(
        component.findAll('[aria-selected="true"] button').map((button) => button.attributes("data-date")),
      ).toStrictEqual([epoch.toString(), nextDay.toString(), to.toString()]);
    });

    test("ends a range on the second press, a day before its start becoming the start", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { from: nextDay, isRange: true, label } });
      await component.get(getDaySelector(epoch.toString())).trigger("click");

      expect(component.emitted<[Temporal.PlainDate]>("update:to")?.map(([date]) => date.toString())).toStrictEqual([
        nextDay.toString(),
      ]);
      expect(component.emitted<[Temporal.PlainDate]>("update:from")?.map(([date]) => date.toString())).toStrictEqual([
        epoch.toString(),
      ]);
    });

    test("starts a new range on a press after a range has its end", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { from: epoch, isRange: true, label, to: epoch } });
      await component.get(getDaySelector(nextDay.toString())).trigger("click");

      expect(component.emitted<[Temporal.PlainDate]>("update:from")?.map(([date]) => date.toString())).toStrictEqual([
        nextDay.toString(),
      ]);
      expect(component.emitted("update:to")).toStrictEqual([[undefined]]);
    });

    test("previews the span out to the day under the pointer, which Escape lets go of while keeping the start", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { from: epoch, isRange: true, label } });
      await component.get(getDaySelector(nextDay.toString())).trigger("mouseenter");

      expect(component.findAll("[data-preview]").map((button) => button.attributes("data-date"))).toStrictEqual([
        epoch.toString(),
        nextDay.toString(),
      ]);
      expect(
        component.findAll('[aria-selected="true"] button').map((button) => button.attributes("data-date")),
      ).toStrictEqual([epoch.toString()]);

      await component.get(getDaySelector(nextDay.toString())).trigger("keydown", { key: "Escape" });

      expect(component.find("[data-preview]").exists()).toBe(false);
      expect(component.emitted("update:from")).toBeUndefined();
    });

    test("shows a range's two months side by side, walking out of the first into the second without turning the page", async () => {
      expect.hasAssertions();

      const lastDay = epoch.add({ days: epoch.daysInMonth - 1 });
      const nextMonthDay = lastDay.add({ days: 1 });
      const component = await mountSuspended(UiCalendar, {
        attachTo: document.body,
        props: { from: lastDay, isRange: true, label },
      });
      const grids = component.findAll('[role="grid"]');

      expect(grids).toHaveLength(2);
      expect(grids.map((grid) => grid.findAll("button").length)).toStrictEqual([
        epoch.daysInMonth,
        nextMonthDay.daysInMonth,
      ]);

      await component.get(getDaySelector(lastDay.toString())).trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(document.activeElement).toBe(component.get(getDaySelector(nextMonthDay.toString())).element);

      await component.get(getDaySelector(lastDay.toString())).trigger("click");

      expect(
        component.findAll('[role="grid"]').map((grid) => grid.get("button").attributes("data-date")),
      ).toStrictEqual([epoch.toString(), nextMonthDay.toString()]);
    });

    // A range's start can be set from outside the grid, and a start off the months shown would be a range nobody sees
    test("turns the months to a range start set from outside", async () => {
      expect.hasAssertions();

      const laterDay = epoch.add({ months: 3 });
      const component = await mountSuspended(UiCalendar, { props: { from: epoch, isRange: true, label } });
      await component.setProps({ from: laterDay });

      expect(component.find(getDaySelector(epoch.toString())).exists()).toBe(false);
      expect(component.find(getDaySelector(laterDay.toString())).exists()).toBe(true);
    });

    test("says a day before its minimum is disabled and never chooses it", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiCalendar, { props: { label, max: nextDay, min: nextDay } });
      const day = component.get(getDaySelector(epoch.toString()));
      await day.trigger("click");

      expect(day.attributes("aria-disabled")).toBe("true");
      expect(component.emitted("update:modelValue")).toBeUndefined();
    });

    test("starts each week on Monday, so the first row opens on the Monday before the month's first day", async () => {
      expect.hasAssertions();

      const monday = epoch.subtract({ days: epoch.dayOfWeek - 1 });
      const component = await mountSuspended(UiCalendar, { props: { label, modelValue: epoch } });

      expect(component.get("tbody [data-date]").attributes("data-date")).toBe(monday.toString());
    });

    test("chooses a day of the month before on click, turning the page to its month", async () => {
      expect.hasAssertions();

      const previousDay = epoch.subtract({ days: 1 });
      const component = await mountSuspended(UiCalendar, { props: { label, modelValue: epoch } });

      expect(component.get(getDaySelector(previousDay.toString())).attributes("data-outside")).toBe("true");

      await component.get(getDaySelector(previousDay.toString())).trigger("click");

      expect(
        component.emitted<[Temporal.PlainDate]>("update:modelValue")?.map(([date]) => date.toString()),
      ).toStrictEqual([previousDay.toString()]);
      expect(component.get(getDaySelector(previousDay.toString())).attributes("data-outside")).toBeUndefined();
    });

    test("moves today's ring on to the next day as the clock passes midnight while the calendar is open", async () => {
      expect.hasAssertions();

      vi.useFakeTimers({ now: 0, toFake: ["Date", "setInterval", "clearInterval"] });
      const epochDay = getZonedDateTime(new Date(0)).toPlainDate();
      const component = await mountSuspended(UiCalendar, { props: { label } });

      expect(component.get('[aria-current="date"]').attributes("data-date")).toBe(epochDay.toString());

      vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 24 }));
      vi.advanceTimersByTime(CALENDAR_CLOCK_INTERVAL_MS);
      await flushPromises();

      expect(component.get('[aria-current="date"]').attributes("data-date")).toBe(epochDay.add({ days: 1 }).toString());
    });
  });
});
