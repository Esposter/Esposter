import { z } from "zod";

export const DatePartType = {
  Day: "Day",
  Hour: "Hour",
  Minute: "Minute",
  Month: "Month",
  Weekday: "Weekday",
  Year: "Year",
} as const;
export type DatePartType = (typeof DatePartType)[keyof typeof DatePartType];

export const datePartTypeSchema = z.enum(DatePartType).meta({ title: "Part" }) satisfies z.ZodType<DatePartType>;
