import type { EmailHeroMode } from "#shared/models/pageBuilder/email/EmailHeroMode";
import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailVerticalAlign } from "#shared/models/pageBuilder/email/EmailVerticalAlign";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailHeroModeSchema } from "#shared/models/pageBuilder/email/EmailHeroMode";
import { emailVerticalAlignSchema } from "#shared/models/pageBuilder/email/EmailVerticalAlign";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

// A band with a background image behind its content
export interface EmailHeroProps extends PageNodeProps {
  backgroundColor: string;
  backgroundUrl: string;
  content: EmailNode[];
  height: string;
  mode: EmailHeroMode;
  padding: string;
  verticalAlign: EmailVerticalAlign;
}

export const createEmailHeroPropsSchema = (nodeSchema: z.ZodType<EmailNode>): z.ZodType<EmailHeroProps> =>
  z.object({
    ...pageNodePropsSchema.shape,
    backgroundColor: emailColorSchema,
    backgroundUrl: pageUrlSchema,
    content: createSlotSchema(nodeSchema),
    height: emailLengthSchema,
    mode: emailHeroModeSchema,
    padding: emailPaddingSchema,
    verticalAlign: emailVerticalAlignSchema,
  });
