import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

// A link drawn as a button, so it is announced and followed as the link it is
export interface ButtonProps extends WebpageNodeProps {
  href: string;
  isNewTab: boolean;
  label: string;
}

export const buttonPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  href: pageUrlSchema,
  isNewTab: z.boolean(),
  label: pageTextSchema.min(1),
}) satisfies z.ZodType<ButtonProps>;
