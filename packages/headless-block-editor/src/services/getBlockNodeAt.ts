import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";

import { getSlotChildren } from "#src/services/getSlotChildren";
import { parseArrayIndex } from "@esposter/shared";

// The node a list of segments names, read down the typed tree: an index into the list, then a slot and an index into that slot's list, and so on
// A segment that names no node, or a prop that is not a slot the port returns, yields undefined
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
  return getBlockNodeAt(getSlotChildren(children, node, slot), descendantSegments, children);
};
