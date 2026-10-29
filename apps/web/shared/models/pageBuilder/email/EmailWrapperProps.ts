import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailSectionLayout } from "#shared/models/pageBuilder/email/EmailSectionLayout";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailSectionLayoutSchema } from "#shared/models/pageBuilder/email/EmailSectionLayout";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

// A band around sections and heroes that shares one background
export interface EmailWrapperProps extends PageNodeProps, EmailSectionLayout {
  content: EmailNode[];
}

export const createEmailWrapperPropsSchema = (nodeSchema: z.ZodType<EmailNode>): z.ZodType<EmailWrapperProps> =>
  z.object({ ...pageNodePropsSchema.shape, ...emailSectionLayoutSchema.shape, content: createSlotSchema(nodeSchema) });
