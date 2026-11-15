/* eslint-disable perfectionist/sort-objects -- grouped by separator, the order the picker lists */
import { z } from "zod";

export const DateFormat = {
  // Slash-separated
  "D/M/YYYY": "D/M/YYYY",
  "DD/MM/YYYY": "DD/MM/YYYY",
  "M/D/YYYY": "M/D/YYYY",
  "MM/DD/YYYY": "MM/DD/YYYY",
  "YYYY/MM/DD": "YYYY/MM/DD",
  // Dash-separated
  "DD-MM-YYYY": "DD-MM-YYYY",
  "MM-DD-YYYY": "MM-DD-YYYY",
  "YYYY-MM-DD": "YYYY-MM-DD",
  // ISO datetime
  "YYYY-MM-DDTHH:mm:ss": "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm:ssZ": "YYYY-MM-DDTHH:mm:ssZ",
} as const;
export type DateFormat = (typeof DateFormat)[keyof typeof DateFormat];

export const dateFormatSchema = z.enum(DateFormat) satisfies z.ZodType<DateFormat>;

export const DateFormats = Object.values(DateFormat);
