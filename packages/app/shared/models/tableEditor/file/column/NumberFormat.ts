import { z } from "zod";

export enum NumberFormat {
  Compact = "Compact",
  Currency = "Currency",
  Percentage = "Percentage",
  Plain = "Plain",
  Scientific = "Scientific",
}

export const numberFormatSchema = z.enum(NumberFormat);
