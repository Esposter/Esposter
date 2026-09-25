// @vitest-environment nuxt
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import UiEventCalendar from "@/components/Ui/EventCalendar/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiCalendarView } from "@/models/ui/UiCalendarView";
import { UiStyles } from "@/models/ui/UiStyle";
import {
  CALENDAR_DAY_EVENT_LIMIT,
  CALENDAR_OPENING_HOUR,
  CALENDAR_SLOT_DURATION,
  CALENDAR_WORK_WEEK_DAY_COUNT,
} from "@/services/ui/constants";
import { getZonedDateTime, takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

// A day of the month's grid, found by the ISO date it carries
const getDaySelector = (isoDate: string) => `[role="gridcell"][data-date="${isoDate}"]`;
// A slot of the hours, found by the ISO date and time it starts at
const getSlotSelector = (isoDateTime: string) => `[role="gridcell"][data-slot="${isoDateTime}"]`;

describe("uiEventCalendar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const epoch = new Date(0);
    const epochZonedDateTime = getZonedDateTime(epoch);
    // The epoch's own day where the test runs, which the calendar shows the epoch's event under
    const date = epochZonedDateTime.toPlainDate();
    const nextDay = date.add({ days: 1 });
    const event: UiCalendarEvent = { id: crypto.randomUUID(), start: epoch, title: "title" };
    const mountEventCalendar = async (props: Partial<InstanceType<typeof UiEventCalendar>["$props"]> = {}) => {
      // Attached, so a key that moves the focus can be read off the document
      const component = await mountSuspended(UiEventCalendar, {
        attachTo: document.body,
        props: { date, events: [event], label, ...props },
      });
      await flushPromises();
      return component;
    };
    // The instant a moved event is read out at, from the live region under the views
    const getAnnouncedStart = (component: Awaited<ReturnType<typeof mountEventCalendar>>) =>
      component.get("[aria-live][sr-only] time").attributes("datetime");

    afterEach(() => {
      document.body.innerHTML = "";
    });

    test("is a region named by its label that shows an event under the day it starts on", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();

      expect(component.get("section").attributes("aria-label")).toBe(label);
      expect(component.get(getDaySelector(date.toString())).text()).toContain(event.title);
      expect(component.get(getDaySelector(nextDay.toString())).text()).not.toContain(event.title);
    });

    test("folds a day's events past its limit into a count", async () => {
      expect.hasAssertions();

      const events = Array.from({ length: CALENDAR_DAY_EVENT_LIMIT + 1 }, () => ({
        ...event,
        id: crypto.randomUUID(),
      }));
      const component = await mountEventCalendar({ events });

      expect(component.get(getDaySelector(date.toString())).findAll(".event")).toHaveLength(CALENDAR_DAY_EVENT_LIMIT);
      expect(component.get(getDaySelector(date.toString())).text()).toContain("1 more");
    });

    test("opens an event on a click", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();
      await component.get(".event").trigger("click");

      expect(component.emitted("open")).toStrictEqual([[event.id]]);
    });

    test("moves an event dropped on another day there, keeping its time", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();
      await component.get(".event").trigger("dragstart");
      await component.get(getDaySelector(nextDay.toString())).trigger("drop");

      expect(component.emitted<[string, Date]>("move")?.map(([id, start]) => [id, start.getTime()])).toStrictEqual([
        [event.id, epochZonedDateTime.add({ days: 1 }).epochMilliseconds],
      ]);
    });

    test("moves nothing on a drop after a drag that ended elsewhere", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();
      await component.get(".event").trigger("dragstart");
      await component.get(".event").trigger("dragend");
      await component.get(getDaySelector(nextDay.toString())).trigger("drop");

      expect(component.emitted("move")).toBeUndefined();
    });

    test("draws a column per day of the week, and the working days alone in a work week", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar({ view: UiCalendarView.Week });

      expect(component.findAll(".column")).toHaveLength(date.daysInWeek);

      await component.setProps({ view: UiCalendarView.WorkWeek });
      await flushPromises();

      expect(component.findAll(".column")).toHaveLength(CALENDAR_WORK_WEEK_DAY_COUNT);
    });

    test("selects the day a click on its empty space lands on, one day at a time", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();
      await component.get(getDaySelector(date.toString())).trigger("click");
      await component.get(getDaySelector(nextDay.toString())).trigger("click");

      expect(
        component.findAll('[role="gridcell"][data-selected]').map((day) => day.attributes("data-date")),
      ).toStrictEqual([nextDay.toString()]);
    });

    test("selects the slot a click lands on", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar({ view: UiCalendarView.Day });
      const slots = component.get(`.column[data-date="${String(date)}"]`).findAll(".slot");
      await takeOne(slots, 0).trigger("click");

      expect(slots.map((slot) => slot.attributes("data-selected") !== undefined)).toStrictEqual(
        slots.map((_slot, index) => index === 0),
      );
    });

    test("steps a view at a time", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar({ view: UiCalendarView.Day });
      await component.get('[aria-label="Next day"]').trigger("click");

      expect(component.emitted<[Temporal.PlainDate]>("update:date")?.map(([day]) => day.toString())).toStrictEqual([
        nextDay.toString(),
      ]);
    });

    test("creates at the start of the working day on a double click of an empty day, only where it can", async () => {
      expect.hasAssertions();

      const onCreate = vi.fn<(start: Date) => void>();
      const component = await mountEventCalendar({ onCreate });
      await component.get(getDaySelector(nextDay.toString())).trigger("dblclick");

      expect(onCreate.mock.calls.map(([start]) => getZonedDateTime(start).toPlainDateTime().toString())).toStrictEqual([
        nextDay.toPlainDateTime({ hour: CALENDAR_OPENING_HOUR }).toString(),
      ]);

      await component.setProps({ onCreate: undefined });

      expect(component.get(getDaySelector(nextDay.toString())).classes()).not.toContain("cursor-cell");
    });

    test("walks the month's days by arrow from one tab stop, selecting the day walked to, and creates on Enter", async () => {
      expect.hasAssertions();

      const onCreate = vi.fn<(start: Date) => void>();
      const component = await mountEventCalendar({ onCreate });
      const grid = component.get('[role="grid"][aria-label="Month"]');

      expect(grid.findAll('[tabindex="0"]').map((day) => day.attributes("data-date"))).toStrictEqual([date.toString()]);

      await component.get(getDaySelector(date.toString())).trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(document.activeElement).toBe(component.get(getDaySelector(nextDay.toString())).element);
      expect(component.get(getDaySelector(nextDay.toString())).attributes("aria-selected")).toBe("true");
      expect(component.emitted<[Temporal.PlainDate]>("update:date")?.map(([day]) => day.toString())).toStrictEqual([
        nextDay.toString(),
      ]);

      await component.get(getDaySelector(nextDay.toString())).trigger("keydown", { key: "Enter" });

      expect(onCreate.mock.calls.map(([start]) => getZonedDateTime(start).toPlainDateTime().toString())).toStrictEqual([
        nextDay.toPlainDateTime({ hour: CALENDAR_OPENING_HOUR }).toString(),
      ]);
    });

    test("moves an event a day by Alt and an arrow in the month, and reads out its new time", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();
      await component.get(".event").trigger("keydown", { altKey: true, key: "ArrowRight" });
      const start = new Date(epochZonedDateTime.add({ days: 1 }).epochMilliseconds);

      expect(component.emitted("move")).toStrictEqual([[event.id, start]]);
      expect(getAnnouncedStart(component)).toBe(start.toISOString());
    });

    test("walks the hours' slots by arrow from the start of the working day, and creates on Enter", async () => {
      expect.hasAssertions();

      const onCreate = vi.fn<(start: Date) => void>();
      const component = await mountEventCalendar({ onCreate, view: UiCalendarView.Day });
      const openingSlot = date.toPlainDateTime({ hour: CALENDAR_OPENING_HOUR });
      const nextSlot = openingSlot.add(CALENDAR_SLOT_DURATION);

      expect(
        component
          .get('[role="grid"][aria-label="Hours"]')
          .findAll('[tabindex="0"]')
          .map((slot) => slot.attributes("data-slot")),
      ).toStrictEqual([openingSlot.toString()]);

      await component.get(getSlotSelector(openingSlot.toString())).trigger("keydown", { key: "ArrowDown" });
      await flushPromises();

      expect(document.activeElement).toBe(component.get(getSlotSelector(nextSlot.toString())).element);

      await component.get(getSlotSelector(nextSlot.toString())).trigger("keydown", { key: "Enter" });

      expect(onCreate.mock.calls.map(([start]) => getZonedDateTime(start).toPlainDateTime().toString())).toStrictEqual([
        nextSlot.toString(),
      ]);
    });

    test("moves an event a slot by Alt and an arrow in the hours, onto the slot after its own", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar({ view: UiCalendarView.Day });
      await component.get(".event").trigger("keydown", { altKey: true, key: "ArrowDown" });
      const slotStart = epochZonedDateTime.round({
        roundingIncrement: CALENDAR_SLOT_DURATION.total("minutes"),
        roundingMode: "floor",
        smallestUnit: "minute",
      });
      const start = new Date(slotStart.add(CALENDAR_SLOT_DURATION).epochMilliseconds);

      expect(component.emitted("move")).toStrictEqual([[event.id, start]]);
      expect(getAnnouncedStart(component)).toBe(start.toISOString());
    });
  });
});
