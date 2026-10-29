import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailSectionLayout } from "#shared/models/pageBuilder/email/EmailSectionLayout";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailSectionLayoutSchema } from "#shared/models/pageBuilder/email/EmailSectionLayout";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

export interface EmailSectionProps extends PageNodeProps, EmailSectionLayout {
  content: EmailNode[];
}

export const createEmailSectionPropsSchema = (nodeSchema: z.ZodType<EmailNode>): z.ZodType<EmailSectionProps> =>
  z.object({ ...pageNodePropsSchema.shape, ...emailSectionLayoutSchema.shape, content: createSlotSchema(nodeSchema) });
