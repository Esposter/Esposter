import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import type { EmailTypography } from "#shared/models/pageBuilder/email/EmailTypography";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailTypographySchema } from "#shared/models/pageBuilder/email/EmailTypography";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

export interface EmailButtonProps extends PageNodeProps, EmailTypography {
  align: EmailAlign;
  backgroundColor: string;
  borderRadius: string;
  href: string;
  innerPadding: string;
  isNewTab: boolean;
  label: string;
  padding: string;
}

export const emailButtonPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  ...emailTypographySchema.shape,
  align: emailAlignSchema,
  backgroundColor: emailColorSchema,
  borderRadius: emailLengthSchema,
  href: pageUrlSchema,
  innerPadding: emailPaddingSchema,
  isNewTab: z.boolean(),
  label: pageTextSchema.min(1),
  padding: emailPaddingSchema,
}) satisfies z.ZodType<EmailButtonProps>;
