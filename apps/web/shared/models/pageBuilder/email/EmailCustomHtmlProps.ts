import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { customHtmlSchema } from "#shared/services/pageBuilder/customHtmlSchema";
import { z } from "zod";

export interface EmailCustomHtmlProps extends PageNodeProps {
  html: string;
}

export const emailCustomHtmlPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  html: customHtmlSchema,
}) satisfies z.ZodType<EmailCustomHtmlProps>;
