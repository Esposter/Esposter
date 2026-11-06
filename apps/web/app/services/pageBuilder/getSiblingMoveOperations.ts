import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";
import type { JsonPatchOperation } from "@esposter/shared";

import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { parseArrayIndex, parseJsonPointer } from "@esposter/shared";
import { getBlockNode, moveBlockNode } from "headless-block-editor";

// The move of a node to the index `offset` away from it in its own slot, or none when no sibling sits at that index
export const getSiblingMoveOperations: PageBuilderHelper<
  JsonPatchOperation[],
  [nodePointer: string, offset: number]
> = (kind, document, nodePointer, offset) => {
  const segments = parseJsonPointer(nodePointer);
  const slotPointer = getNodeSlotPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === undefined) return [];

  const siblingIndex = index + offset;
  if (siblingIndex < 0 || !getBlockNode(document, `${slotPointer}/${siblingIndex}`, kind.children)) return [];

  return moveBlockNode(document, kind.registry, kind.children, nodePointer, slotPointer, siblingIndex);
};
