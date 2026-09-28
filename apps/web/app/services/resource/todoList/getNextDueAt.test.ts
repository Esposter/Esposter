import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";
import { getNextDueAt } from "@/services/resource/todoList/getNextDueAt";
import { describe, expect, test } from "vitest";

describe(getNextDueAt, () => {
  const timeZone = "UTC";
  const toDate = (isoDate: string) =>
    new Date(Temporal.PlainDate.from(isoDate).toZonedDateTime(timeZone).epochMilliseconds);

  test.each([
    [RecurrenceUnit.Day, 2, "1970-01-01", "1970-01-03"],
    [RecurrenceUnit.Week, 1, "1970-01-01", "1970-01-08"],
    // The 1st was a Thursday, so two weekdays on is Monday the 5th
    [RecurrenceUnit.Weekday, 2, "1970-01-01", "1970-01-05"],
  ])("steps a %s repeat of %i from %s to %s", (unit, interval, dueDate, expectedDueDate) => {
    expect.hasAssertions();

    expect(getNextDueAt(toDate(dueDate), { interval, startsAt: toDate(dueDate), unit }, timeZone)).toStrictEqual(
      toDate(expectedDueDate),
    );
  });

  test("returns a monthly todo to the day it started on after a shorter month clamped it", () => {
    expect.hasAssertions();

    const recurrence = { interval: 1, startsAt: toDate("1970-01-31"), unit: RecurrenceUnit.Month };

    expect(getNextDueAt(toDate("1970-01-31"), recurrence, timeZone)).toStrictEqual(toDate("1970-02-28"));
    expect(getNextDueAt(toDate("1970-02-28"), recurrence, timeZone)).toStrictEqual(toDate("1970-03-31"));
  });

  test("keeps the time of day", () => {
    expect.hasAssertions();

    const dueAt = new Date(Temporal.Duration.from({ hours: 9 }).total("milliseconds"));

    expect(getNextDueAt(dueAt, { interval: 1, startsAt: dueAt, unit: RecurrenceUnit.Day }, timeZone)).toStrictEqual(
      new Date(Temporal.Duration.from({ hours: 33 }).total("milliseconds")),
    );
  });

  test("keeps the start's time of day after a daylight-saving gap moved one due date", () => {
    expect.hasAssertions();

    const newYorkTimeZone = "America/New_York";
    const toNewYorkDate = (isoDateTime: string) =>
      new Date(Temporal.PlainDateTime.from(isoDateTime).toZonedDateTime(newYorkTimeZone).epochMilliseconds);
    const recurrence = { interval: 1, startsAt: toNewYorkDate("1970-04-25T02:30"), unit: RecurrenceUnit.Day };

    expect(getNextDueAt(toNewYorkDate("1970-04-26T03:30"), recurrence, newYorkTimeZone)).toStrictEqual(
      toNewYorkDate("1970-04-27T02:30"),
    );
  });
});
