import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailVerticalAlign } from "#shared/models/pageBuilder/email/EmailVerticalAlign";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailVerticalAlignSchema } from "#shared/models/pageBuilder/email/EmailVerticalAlign";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { z } from "zod";

export interface EmailColumnProps extends PageNodeProps {
  backgroundColor: string;
  content: EmailNode[];
  padding: string;
  verticalAlign: EmailVerticalAlign;
}

export const createEmailColumnPropsSchema = (nodeSchema: z.ZodType<EmailNode>): z.ZodType<EmailColumnProps> =>
  z.object({
    ...pageNodePropsSchema.shape,
    backgroundColor: emailColorSchema,
    content: createSlotSchema(nodeSchema),
    padding: emailPaddingSchema,
    verticalAlign: emailVerticalAlignSchema,
  });
