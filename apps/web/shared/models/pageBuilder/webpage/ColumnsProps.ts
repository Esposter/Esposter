import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

// Columns side by side, stacked at the mobile breakpoint
export interface ColumnsProps extends WebpageNodeProps {
  content: WebpageNode[];
}

export const createColumnsPropsSchema = (nodeSchema: z.ZodType<WebpageNode>): z.ZodType<ColumnsProps> =>
  z.object({ ...webpageNodePropsSchema.shape, content: createSlotSchema(nodeSchema) });
