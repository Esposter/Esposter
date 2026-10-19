import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { checkBlockNodeIds } from "#src/services/checkBlockNodeIds";
import { createBlockNodeSchema } from "#src/services/createBlockNodeSchema";
import { z } from "zod";

// A slot's children checked as a list by the same typed node schema as a document: each copy's type and props, then the ids across the copies
export const createBlockNodesSchema = <TNode extends BlockNode, TRootProps extends object>(
  registry: BlockRegistry<TNode, TRootProps>,
  acceptedTypes: string[],
): z.ZodType<TNode[]> =>
  z.array(createBlockNodeSchema(registry, acceptedTypes)).superRefine((nodes, context) => {
    checkBlockNodeIds(context, registry, nodes, [], { count: 0, ids: new Set() });
  });
