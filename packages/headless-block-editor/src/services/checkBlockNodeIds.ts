import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { z } from "zod";

import { checkAcceptedType } from "#src/services/checkAcceptedType";
import { getBlockSlots } from "#src/services/getBlockSlots";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getSlotItems } from "#src/services/getSlotItems";

// Counts each node of a parsed tree and refuses a node whose id an earlier node holds, in any slot, naming the repeated node's id.
// A nested child whose type its parent's slot does not accept in the registry is refused too, so the parse and the types the registry reports agree.
// Its callers refine only a parse that raised no issue, so the nodes it is handed are the schema's typed output
export const checkBlockNodeIds = <TNode extends BlockNode>(
  context: z.RefinementCtx,
  registry: BlockRegistry<TNode>,
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

    const definitionSlots = getBlockTypeDefinition(registry, node.type)?.slots ?? {};
    for (const [slot, slotNodes] of Object.entries(getBlockSlots(children, node))) {
      const slotSegments = [...nodeSegments, "props", slot];
      const acceptedTypes: readonly string[] = getSlotItems(definitionSlots, slot);
      for (const [childIndex, child] of slotNodes.entries())
        checkAcceptedType(context, child.type, acceptedTypes, [...slotSegments, childIndex]);
      checkBlockNodeIds(context, registry, children, slotNodes, slotSegments, collection);
    }
  }
};
