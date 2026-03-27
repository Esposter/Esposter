import { z } from "zod";

export enum NumberFormat {
  Compact = "Compact",
  Currency = "Currency",
  Percentage = "Percentage",
  Plain = "Plain",
  Scientific = "Scientific",
}

export const numberFormatSchema = z.enum(NumberFormat) satisfies z.ZodType<NumberFormat>;

export const NumberFormats: ReadonlySet<NumberFormat> = new Set(Object.values(NumberFormat));
