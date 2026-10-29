import type { TooltipPosition } from "#shared/models/pageBuilder/webpage/TooltipPosition";
import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { tooltipPositionSchema } from "#shared/models/pageBuilder/webpage/TooltipPosition";
import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { z } from "zod";

// Text that describes itself on hover and on focus, the description read as the trigger's own
export interface TooltipProps extends WebpageNodeProps {
  position: TooltipPosition;
  text: string;
  tooltipText: string;
}

export const tooltipPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  position: tooltipPositionSchema,
  text: pageTextSchema.min(1),
  tooltipText: pageTextSchema.min(1),
}) satisfies z.ZodType<TooltipProps>;
