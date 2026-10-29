import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import type { EmailBorderStyle } from "#shared/models/pageBuilder/email/EmailBorderStyle";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailBorderStyleSchema } from "#shared/models/pageBuilder/email/EmailBorderStyle";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { z } from "zod";

export interface EmailDividerProps extends PageNodeProps {
  align: EmailAlign;
  borderColor: string;
  borderStyle: EmailBorderStyle;
  borderWidth: string;
  padding: string;
  width: string;
}

export const emailDividerPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  align: emailAlignSchema,
  borderColor: emailColorSchema,
  borderStyle: emailBorderStyleSchema,
  borderWidth: emailLengthSchema,
  padding: emailPaddingSchema,
  width: emailLengthSchema,
}) satisfies z.ZodType<EmailDividerProps>;
