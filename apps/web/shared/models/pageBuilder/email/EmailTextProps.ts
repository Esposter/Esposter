import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import type { EmailTypography } from "#shared/models/pageBuilder/email/EmailTypography";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";
import type { JSONContent } from "@tiptap/core";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailTypographySchema } from "#shared/models/pageBuilder/email/EmailTypography";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { TEXT_SCHEMA } from "#shared/services/pageBuilder/text/constants";
import { createTextContentSchema } from "#shared/services/pageBuilder/text/createTextContentSchema";
import { z } from "zod";

export interface EmailTextProps extends PageNodeProps, EmailTypography {
  align: EmailAlign;
  content: JSONContent;
  padding: string;
}

export const emailTextPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  ...emailTypographySchema.shape,
  align: emailAlignSchema,
  content: createTextContentSchema(TEXT_SCHEMA),
  padding: emailPaddingSchema,
}) satisfies z.ZodType<EmailTextProps>;
