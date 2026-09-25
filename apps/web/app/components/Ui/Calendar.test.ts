// @vitest-environment nuxt
import UiCalendar from "@/components/Ui/Calendar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { TEST_EPOCH_DATE } from "@/services/ui/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { enableAutoUnmount, flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

// A day of the grid, found by the ISO date it carries
const getDaySelector = (isoDate: string) => `[data-date="${isoDate}"]`;

describe("uiCalendar", () => {
  enableAutoUnmount(afterEach);

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

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
      const laterDaySelector = getDaySelector(laterDay.toString());

      expect(component.get(laterDaySelector).attributes("data-date")).toBe(laterDay.toString());
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
