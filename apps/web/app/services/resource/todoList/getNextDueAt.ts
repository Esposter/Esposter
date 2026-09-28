import type { Recurrence } from "#shared/models/resource/todoList/Recurrence";

import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";
import { exhaustiveGuard } from "@esposter/shared";

const SATURDAY = 6;
// The next due date of a repeating todo, at the same time of day in the time zone given. Days, weekdays and weeks step
// From the current due date; months and years count from when the repeat started instead, taking the first multiple of
// The interval past the current due date, so a day a shorter month clamped returns in the next month that has it
export const getNextDueAt = (dueAt: Date, { interval, startsAt, unit }: Recurrence, timeZone: string): Date => {
  const dueDateTime = Temporal.Instant.fromEpochMilliseconds(dueAt.getTime()).toZonedDateTimeISO(timeZone);
  const dueDate = dueDateTime.toPlainDate();
  const toDueAt = (date: Temporal.PlainDate) =>
    new Date(date.toZonedDateTime({ plainTime: dueDateTime.toPlainTime(), timeZone }).epochMilliseconds);

  switch (unit) {
    case RecurrenceUnit.Day:
      return toDueAt(dueDate.add({ days: interval }));
    case RecurrenceUnit.Month:
    case RecurrenceUnit.Year: {
      const startDate = Temporal.Instant.fromEpochMilliseconds(startsAt.getTime())
        .toZonedDateTimeISO(timeZone)
        .toPlainDate();
      const field = unit === RecurrenceUnit.Month ? "months" : "years";
      let step = interval;
      while (Temporal.PlainDate.compare(startDate.add({ [field]: step }), dueDate) <= 0) step += interval;
      return toDueAt(startDate.add({ [field]: step }));
    }
    case RecurrenceUnit.Week:
      return toDueAt(dueDate.add({ weeks: interval }));
    case RecurrenceUnit.Weekday: {
      let nextDate = dueDate;
      for (let count = 0; count < interval; count++)
        do nextDate = nextDate.add({ days: 1 });
        while (nextDate.dayOfWeek >= SATURDAY);
      return toDueAt(nextDate);
    }
    default:
      return exhaustiveGuard(unit);
  }
};
