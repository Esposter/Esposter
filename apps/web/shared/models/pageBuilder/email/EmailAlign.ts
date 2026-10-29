import { z } from "zod";

export enum EmailAlign {
  Center = "center",
  Left = "left",
  Right = "right",
}

export const emailAlignSchema = z.enum(EmailAlign) satisfies z.ZodType<EmailAlign>;
