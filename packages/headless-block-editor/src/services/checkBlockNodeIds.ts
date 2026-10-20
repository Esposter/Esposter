import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockNode } from "#src/models/BlockNode";
import type { z } from "zod";

// Counts each node of a parsed tree and refuses a node whose id an earlier node holds, in any slot, naming the repeated node's id
// Its callers refine only a parse that raised no issue, so the nodes it is handed are the schema's typed output
export const checkBlockNodeIds = <TNode extends BlockNode>(
  context: z.RefinementCtx,
  children: BlockChildren<TNode>,
  nodes: readonly TNode[],
  segments: PropertyKey[],
  collection: BlockCollection,
): void => {
  for (const [index, node] of nodes.entries()) {
    const nodeSegments = [...segments, index];
    collection.count++;

    if (collection.ids.has(node.props.id))
      context.addIssue({ code: "custom", message: "repeats an id", path: [...nodeSegments, "props", "id"] });
    else collection.ids.add(node.props.id);

    for (const [slot, slotNodes] of Object.entries(children(node)))
      checkBlockNodeIds(context, children, slotNodes, [...nodeSegments, "props", slot], collection);
  }
};
