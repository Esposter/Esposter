import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

export interface ColumnProps extends WebpageNodeProps {
  content: WebpageNode[];
}

export const createColumnPropsSchema = (nodeSchema: z.ZodType<WebpageNode>): z.ZodType<ColumnProps> =>
  z.object({ ...webpageNodePropsSchema.shape, content: createSlotSchema(nodeSchema) });
