import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { moveBlockNode } from "#src/services/moveBlockNode";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// Moves a node to just after its parent, in the slot that holds the parent: the parent's index is not shifted by the node's removal
// No operations when the node sits in the root's content, since it has no parent, or when that slot refuses the node's type
export const moveOutAfterParent = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodePointer: string,
): JsonPatchOperation[] => {
  const segments = parseJsonPointer(nodePointer);
  const parentIndex = parseArrayIndex(segments.at(-4) ?? "", Number.MAX_SAFE_INTEGER);
  if (parentIndex === undefined) return [];

  return moveBlockNode(document, registry, nodePointer, toJsonPointer(segments.slice(0, -4)), parentIndex + 1);
};
