import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { checkAcceptedType } from "#src/services/checkAcceptedType";
import { checkBlockNodeIds } from "#src/services/checkBlockNodeIds";
import { z } from "zod";

// A list of nodes checked by the consumer's typed node schema, then against the types the slot accepts, then the ids across the nodes
// and the types each nested slot accepts in the registry. The accepted types and ids are checked only on a list that parsed clean, so every node the refinement walks is typed
export const createBlockNodesSchema = <TNode extends BlockNode>(
  nodeSchema: z.ZodType<TNode>,
  registry: BlockRegistry<TNode>,
  children: BlockChildren<TNode>,
  acceptedTypes: readonly string[],
): z.ZodType<TNode[]> =>
  z.array(nodeSchema).superRefine(
    (nodes, context) => {
      for (const [index, node] of nodes.entries()) checkAcceptedType(context, node.type, acceptedTypes, [index]);
      if (context.issues.length === 0)
        checkBlockNodeIds(context, registry, children, nodes, [], { count: 0, ids: new Set() });
    },
    { when: ({ issues }) => issues.length === 0 },
  );
