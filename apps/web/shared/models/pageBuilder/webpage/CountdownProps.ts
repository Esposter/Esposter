import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { z } from "zod";

export interface CountdownProps extends WebpageNodeProps {
  // A calendar date, counted down to its local midnight wherever the page is read
  date: string;
  // Written as text once the date has passed
  endText: string;
}

export const countdownPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  date: z.iso.date(),
  endText: pageTextSchema,
}) satisfies z.ZodType<CountdownProps>;
