import { z } from "zod";

export enum EmailVerticalAlign {
  Bottom = "bottom",
  Middle = "middle",
  Top = "top",
}

export const emailVerticalAlignSchema = z.enum(EmailVerticalAlign) satisfies z.ZodType<EmailVerticalAlign>;
