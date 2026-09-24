// @vitest-environment nuxt
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import UiEventCalendar from "@/components/Ui/EventCalendar/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiCalendarView } from "@/models/ui/UiCalendarView";
import { UiStyles } from "@/models/ui/UiStyle";
import { CALENDAR_DAY_EVENT_LIMIT, CALENDAR_OPENING_HOUR, CALENDAR_WORK_WEEK_DAY_COUNT } from "@/services/ui/constants";
import { getZonedDateTime } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

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
    const getDay = (day: Temporal.PlainDate) => `[data-date="${day.toString()}"]`;
    const mountEventCalendar = async (props: Partial<InstanceType<typeof UiEventCalendar>["$props"]> = {}) => {
      const component = await mountSuspended(UiEventCalendar, { props: { date, events: [event], label, ...props } });
      await flushPromises();
      return component;
    };

    test("is a region named by its label that shows an event under the day it starts on", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar();

      expect(component.get("section").attributes("aria-label")).toBe(label);
      expect(component.get(`li${getDay(date)}`).text()).toContain(event.title);
      expect(component.get(`li${getDay(nextDay)}`).text()).not.toContain(event.title);
    });

    test("folds a day's events past its limit into a count", async () => {
      expect.hasAssertions();

      const events = Array.from({ length: CALENDAR_DAY_EVENT_LIMIT + 1 }, () => ({
        ...event,
        id: crypto.randomUUID(),
      }));
      const component = await mountEventCalendar({ events });

      expect(component.get(`li${getDay(date)}`).findAll(".event")).toHaveLength(CALENDAR_DAY_EVENT_LIMIT);
      expect(component.get(`li${getDay(date)}`).text()).toContain("1 more");
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
      await component.get(`li${getDay(nextDay)}`).trigger("drop");

      expect(component.emitted<[string, Date]>("move")?.map(([id, start]) => [id, start.getTime()])).toStrictEqual([
        [event.id, epochZonedDateTime.add({ days: 1 }).epochMilliseconds],
      ]);
    });

    test("draws a column per day of the week, and the working days alone in a work week", async () => {
      expect.hasAssertions();

      const component = await mountEventCalendar({ view: UiCalendarView.Week });

      expect(component.findAll(".column")).toHaveLength(date.daysInWeek);

      await component.setProps({ view: UiCalendarView.WorkWeek });
      await flushPromises();

      expect(component.findAll(".column")).toHaveLength(CALENDAR_WORK_WEEK_DAY_COUNT);
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
      await component.get(`li${getDay(nextDay)}`).trigger("dblclick");

      expect(onCreate.mock.calls.map(([start]) => getZonedDateTime(start).toPlainDateTime().toString())).toStrictEqual([
        nextDay.toPlainDateTime({ hour: CALENDAR_OPENING_HOUR }).toString(),
      ]);

      await component.setProps({ onCreate: undefined });

      expect(component.get(`li${getDay(nextDay)}`).classes()).not.toContain("cursor-cell");
    });
  });
});
