import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The slot pointer once the node at a pointer is removed: a slot in a later sibling of the same array moves down one index
export const getSlotPointerAfterRemoval = (nodePointer: string, slotPointer: string): string => {
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
