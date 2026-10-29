import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

export interface EmailNavbarProps extends PageNodeProps {
  align: EmailAlign;
  content: EmailNode[];
}

export const createEmailNavbarPropsSchema = (nodeSchema: z.ZodType<EmailNode>): z.ZodType<EmailNavbarProps> =>
  z.object({ ...pageNodePropsSchema.shape, align: emailAlignSchema, content: createSlotSchema(nodeSchema) });
