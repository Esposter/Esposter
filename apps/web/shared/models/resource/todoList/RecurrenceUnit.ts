import { z } from "zod";

// What a repeating todo steps by: a day, the next weekday, a week, a month or a year, each taken an interval at a time
export enum RecurrenceUnit {
  Day = "Day",
  Month = "Month",
  Week = "Week",
  Weekday = "Weekday",
  Year = "Year",
}

export const recurrenceUnitSchema = z.enum(RecurrenceUnit) satisfies z.ZodType<RecurrenceUnit>;
