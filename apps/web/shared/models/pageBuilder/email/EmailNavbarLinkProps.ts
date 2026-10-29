import type { EmailTypography } from "#shared/models/pageBuilder/email/EmailTypography";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailTypographySchema } from "#shared/models/pageBuilder/email/EmailTypography";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

export interface EmailNavbarLinkProps extends PageNodeProps, EmailTypography {
  href: string;
  isNewTab: boolean;
  label: string;
  padding: string;
}

export const emailNavbarLinkPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  ...emailTypographySchema.shape,
  href: pageUrlSchema,
  isNewTab: z.boolean(),
  label: pageTextSchema.min(1),
  padding: emailPaddingSchema,
}) satisfies z.ZodType<EmailNavbarLinkProps>;
