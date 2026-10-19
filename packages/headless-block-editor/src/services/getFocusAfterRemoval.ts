import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";

import { getBlockNode } from "#src/services/getBlockNode";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The node that takes focus when the node at a pointer is removed: its next sibling, which moves into its index
// Otherwise its previous sibling, else its parent, with the root named by the empty pointer
export const getFocusAfterRemoval = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  nodePointer: string,
): string => {
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === undefined || !getBlockNode(document, nodePointer)) return "";

  const slotPointer = toJsonPointer(segments.slice(0, -1));
  if (getBlockNode(document, `${slotPointer}/${index + 1}`)) return `${slotPointer}/${index}`;
  else if (index > 0) return `${slotPointer}/${index - 1}`;
  return toJsonPointer(segments.slice(0, -3));
};
