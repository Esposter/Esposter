import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { getBlockNode } from "#src/services/getBlockNode";
import { removeBlockNode } from "#src/services/removeBlockNode";
import { JsonPatchOperationType, parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The slot pointer once the node at a pointer is removed: a slot in a later sibling of the same array moves down one index
const getSlotPointerAfterRemoval = (nodePointer: string, slotPointer: string): string => {
  const nodeSegments = parseJsonPointer(nodePointer);
  const slotSegments = parseJsonPointer(slotPointer);
  const depth = nodeSegments.length - 1;
  const removedIndex = parseArrayIndex(nodeSegments[depth] ?? "", Number.MAX_SAFE_INTEGER);
  const slotIndex = parseArrayIndex(slotSegments[depth] ?? "", Number.MAX_SAFE_INTEGER);
  const isSibling = toJsonPointer(slotSegments.slice(0, depth)) === toJsonPointer(nodeSegments.slice(0, depth));
  if (removedIndex === undefined || slotIndex === undefined || !isSibling || slotIndex <= removedIndex)
    return slotPointer;

  const shiftedSegments = [...slotSegments];
  shiftedSegments[depth] = String(slotIndex - 1);
  return toJsonPointer(shiftedSegments);
};

// A move is a remove and an add of the same node, refused when the target slot does not accept its type or sits inside
// It. The index is in the target slot once the node is removed, so moving the first of two siblings to the end of their
// Slot is index 1
export const moveBlockNode = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodePointer: string,
  slotPointer: string,
  index: number,
): JsonPatchOperation[] => {
  const node = getBlockNode(document, nodePointer);
  if (
    !node ||
    slotPointer.startsWith(`${nodePointer}/`) ||
    !getAcceptedTypes(document, registry, slotPointer).includes(node.type)
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
