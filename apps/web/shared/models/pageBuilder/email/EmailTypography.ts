import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailFontFamilySchema } from "#shared/services/pageBuilder/email/emailFontFamilySchema";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { z } from "zod";

// The type a text, a button and a navbar link set
export interface EmailTypography {
  color: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
}

export const emailTypographySchema = z.object({
  color: emailColorSchema,
  fontFamily: emailFontFamilySchema,
  fontSize: emailLengthSchema,
  lineHeight: emailLengthSchema,
}) satisfies z.ZodType<EmailTypography>;
