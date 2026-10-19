import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { z } from "zod";

import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getParsedSlotNodes } from "#src/services/getParsedSlotNodes";

// Counts each node of a parsed tree and refuses a node whose id an earlier node holds, in any slot, naming the repeated node's id
// Its callers refine only a parse that raised no issue, so the nodes it is handed are the schema's typed output
export const checkBlockNodeIds = <TNode extends BlockNode>(
  context: z.RefinementCtx,
  registry: BlockRegistry<TNode>,
  nodes: TNode[],
  segments: PropertyKey[],
  collection: BlockCollection,
): void => {
  for (const [index, node] of nodes.entries()) {
    const nodeSegments = [...segments, index];
    collection.count++;

    if (collection.ids.has(node.props.id))
      context.addIssue({ code: "custom", message: "repeats an id", path: [...nodeSegments, "props", "id"] });
    else collection.ids.add(node.props.id);

    for (const slot of Object.keys(getBlockTypeDefinition(registry, node.type)?.slots ?? {}))
      checkBlockNodeIds(
        context,
        registry,
        getParsedSlotNodes(node, slot),
        [...nodeSegments, "props", slot],
        collection,
      );
  }
};
