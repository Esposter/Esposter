import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

// Its tabs, each one's label a tab and its content the panel the tab controls
export interface TabsProps extends WebpageNodeProps {
  content: WebpageNode[];
}

export const createTabsPropsSchema = (nodeSchema: z.ZodType<WebpageNode>): z.ZodType<TabsProps> =>
  z.object({ ...webpageNodePropsSchema.shape, content: createSlotSchema(nodeSchema) });
