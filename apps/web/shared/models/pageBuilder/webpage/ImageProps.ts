import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { checkHasImageAlt } from "#shared/services/pageBuilder/checkHasImageAlt";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

export interface ImageProps extends WebpageNodeProps {
  alt: string;
  // An image that only decorates renders an empty alt, which is the only way to leave its alt empty
  isDecorative: boolean;
  src: string;
}

export const imagePropsSchema = z
  .object({ ...webpageNodePropsSchema.shape, alt: pageTextSchema, isDecorative: z.boolean(), src: pageUrlSchema })
  .refine(checkHasImageAlt, {
    error: "An image needs its alt unless it only decorates",
    path: ["alt"],
  }) satisfies z.ZodType<ImageProps>;
