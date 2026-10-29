import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { z } from "zod";

export interface TabProps extends WebpageNodeProps {
  content: WebpageNode[];
  label: string;
}

export const createTabPropsSchema = (nodeSchema: z.ZodType<WebpageNode>): z.ZodType<TabProps> =>
  z.object({ ...webpageNodePropsSchema.shape, content: createSlotSchema(nodeSchema), label: pageTextSchema.min(1) });
