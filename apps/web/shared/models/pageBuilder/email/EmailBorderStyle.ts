import { z } from "zod";

export enum EmailBorderStyle {
  Dashed = "dashed",
  Dotted = "dotted",
  Solid = "solid",
}

export const emailBorderStyleSchema = z.enum(EmailBorderStyle) satisfies z.ZodType<EmailBorderStyle>;
