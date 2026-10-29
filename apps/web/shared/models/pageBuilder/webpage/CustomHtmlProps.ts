import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { customHtmlSchema } from "#shared/services/pageBuilder/customHtmlSchema";
import { z } from "zod";

export interface CustomHtmlProps extends WebpageNodeProps {
  html: string;
}

export const customHtmlPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  html: customHtmlSchema,
}) satisfies z.ZodType<CustomHtmlProps>;
