import { z } from "zod";

export enum FooterStatisticType {
  Average = "average",
  Maximum = "maximum",
  Minimum = "minimum",
  Summation = "summation",
  UniqueCount = "uniqueCount",
}

export const footerStatisticTypeSchema = z.enum(FooterStatisticType) satisfies z.ZodType<FooterStatisticType>;
