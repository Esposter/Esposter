import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { getBlockNode } from "#src/services/getBlockNode";
import { getSlotPointerAfterRemoval } from "#src/services/getSlotPointerAfterRemoval";
import { removeBlockNode } from "#src/services/removeBlockNode";
import { JsonPatchOperationType } from "@esposter/shared";

// A move is a remove and an add of the same node, refused when the target slot rejects its type or sits inside it.
// The index is in the target slot once the node is removed.
// Moving the first of two siblings to the end of their slot is index 1
export const moveBlockNode = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
  children: BlockChildren<TNode>,
  nodePointer: string,
  slotPointer: string,
  index: number,
): JsonPatchOperation[] => {
  const node = getBlockNode(document, nodePointer, children);
  if (
    !node ||
    slotPointer.startsWith(`${nodePointer}/`) ||
    !getAcceptedTypes(document, registry, children, slotPointer).includes(node.type)
  )
    return [];
  return [
    ...removeBlockNode(nodePointer),
    {
      op: JsonPatchOperationType.Add,
      path: `${getSlotPointerAfterRemoval(nodePointer, slotPointer)}/${index}`,
      value: node,
    },
  ];
};
