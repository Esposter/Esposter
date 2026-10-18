import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { checkBlockNodes } from "#src/services/checkBlockNodes";
import { z } from "zod";

// A slot's children checked as a list: each one's shape, then the registry, the types the slot accepts and the ids
export const createBlockNodesSchema = (registry: BlockRegistry, acceptedTypes: string[]): z.ZodType<BlockNode[]> =>
  z.array(blockNodeShapeSchema).superRefine((nodes, context) => {
    checkBlockNodes(context, registry, nodes, acceptedTypes, [], { count: 0, ids: new Set() });
  });
