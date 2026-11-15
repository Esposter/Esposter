import { z } from "zod";

// What a repeating todo steps by: a day, the next weekday, a week, a month or a year, each taken an interval at a time
export const RecurrenceUnit = { Day: "Day", Month: "Month", Week: "Week", Weekday: "Weekday", Year: "Year" } as const;
export type RecurrenceUnit = (typeof RecurrenceUnit)[keyof typeof RecurrenceUnit];

export const recurrenceUnitSchema = z.enum(RecurrenceUnit) satisfies z.ZodType<RecurrenceUnit>;
