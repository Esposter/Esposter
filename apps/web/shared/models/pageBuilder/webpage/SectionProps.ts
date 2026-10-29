import type { SectionTag } from "#shared/models/pageBuilder/webpage/SectionTag";
import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { sectionTagSchema } from "#shared/models/pageBuilder/webpage/SectionTag";
import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { z } from "zod";

export interface SectionProps extends WebpageNodeProps {
  content: WebpageNode[];
  tag: SectionTag;
}

export const createSectionPropsSchema = (nodeSchema: z.ZodType<WebpageNode>): z.ZodType<SectionProps> =>
  z.object({ ...webpageNodePropsSchema.shape, content: createSlotSchema(nodeSchema), tag: sectionTagSchema });
