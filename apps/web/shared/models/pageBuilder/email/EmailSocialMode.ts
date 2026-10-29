import { z } from "zod";

export enum EmailSocialMode {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

export const emailSocialModeSchema = z.enum(EmailSocialMode) satisfies z.ZodType<EmailSocialMode>;
