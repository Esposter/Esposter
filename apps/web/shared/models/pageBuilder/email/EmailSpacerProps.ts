import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { z } from "zod";

export interface EmailSpacerProps extends PageNodeProps {
  height: string;
}

export const emailSpacerPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  height: emailLengthSchema,
}) satisfies z.ZodType<EmailSpacerProps>;
