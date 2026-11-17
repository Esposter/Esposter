import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";

import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { elementIdSchema } from "#shared/services/pageBuilder/elementIdSchema";
import { z } from "zod";

// The props a node holding its children in slots declares: its style, the children being the core's slot
export const containerPropsSchema = z.object({
  elementId: elementIdSchema,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<{ style?: NodeStyle | undefined }>;
