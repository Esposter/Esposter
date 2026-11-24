import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";

import { getSlotItems } from "#src/services/getSlotItems";
import { parseArrayIndex } from "@esposter/shared";

// The node a list of segments names, read down the typed tree.
// An index picks a node, and a props segment and a slot pick that node's slot list to read on.
// A segment that names no node, or a prop that is not a slot the port returns, yields undefined.
export const getBlockNodeAt = <TNode extends BlockNode>(
  nodes: readonly TNode[],
  segments: string[],
  children: BlockChildren<TNode>,
): TNode | undefined => {
  const [indexSegment, propsSegment, slot, ...descendantSegments] = segments;
  const index = parseArrayIndex(indexSegment ?? "", Number.MAX_SAFE_INTEGER);
  const node = index === undefined ? undefined : nodes[index];
  if (!node || segments.length === 1) return node;
  else if (propsSegment !== "props" || slot === undefined) return undefined;
  return getBlockNodeAt(getSlotItems(children(node), slot), descendantSegments, children);
};
