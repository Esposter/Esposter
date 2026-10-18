import type { BlockNode } from "#src/models/BlockNode";

import { z } from "zod";

// A node's own shape; its slots' children are checked against the registry by createBlockDocumentSchema
export const blockNodeShapeSchema: z.ZodType<BlockNode> = z.object({
  props: z.record(z.string(), z.unknown()),
  type: z.string(),
});
