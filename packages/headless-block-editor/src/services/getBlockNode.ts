import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";

import { getBlockNodeAt } from "#src/services/getBlockNodeAt";
import { parseJsonPointer } from "@esposter/shared";

// The node a pointer names, read down the document's typed content, or undefined when it names nothing that is a node
export const getBlockNode = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  nodePointer: string,
): TNode | undefined => {
  const [rootSegment, ...nodeSegments] = parseJsonPointer(nodePointer);
  return rootSegment === "content" ? getBlockNodeAt(document.content, nodeSegments) : undefined;
};
