import { z } from "zod";

export const NumberFormat = {
  Compact: "Compact",
  Currency: "Currency",
  Percentage: "Percentage",
  Plain: "Plain",
  Scientific: "Scientific",
} as const;
export type NumberFormat = (typeof NumberFormat)[keyof typeof NumberFormat];

export const numberFormatSchema = z.enum(NumberFormat) satisfies z.ZodType<NumberFormat>;

export const NumberFormats: ReadonlySet<NumberFormat> = new Set(Object.values(NumberFormat));
