import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getBlockNode } from "#src/services/getBlockNode";
import { moveBlockNode } from "#src/services/moveBlockNode";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The move of a node to the index `offset` away from it in its own slot, or none when no sibling sits at that index
export const getSiblingMoveOperations = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
  children: BlockChildren<TNode>,
  nodePointer: string,
  offset: number,
): JsonPatchOperation[] => {
  const segments = parseJsonPointer(nodePointer);
  const slotPointer = toJsonPointer(segments.slice(0, -1));
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (
    index === undefined ||
    index + offset < 0 ||
    !getBlockNode(document, `${slotPointer}/${index + offset}`, children)
  )
    return [];

  return moveBlockNode(document, registry, children, nodePointer, slotPointer, index + offset);
};
