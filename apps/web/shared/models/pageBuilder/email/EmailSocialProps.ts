import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailSocialMode } from "#shared/models/pageBuilder/email/EmailSocialMode";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailSocialModeSchema } from "#shared/models/pageBuilder/email/EmailSocialMode";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { z } from "zod";

export interface EmailSocialProps extends PageNodeProps {
  align: EmailAlign;
  content: EmailNode[];
  iconSize: string;
  mode: EmailSocialMode;
  padding: string;
}

export const createEmailSocialPropsSchema = (nodeSchema: z.ZodType<EmailNode>): z.ZodType<EmailSocialProps> =>
  z.object({
    ...pageNodePropsSchema.shape,
    align: emailAlignSchema,
    content: createSlotSchema(nodeSchema),
    iconSize: emailLengthSchema,
    mode: emailSocialModeSchema,
    padding: emailPaddingSchema,
  });
