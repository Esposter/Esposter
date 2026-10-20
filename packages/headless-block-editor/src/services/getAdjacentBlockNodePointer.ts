import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";

import { getBlockLayerRows } from "#src/services/getBlockLayerRows";

// The pointer of the node offset rows from a node in the layer rows, or undefined past either end or for a pointer naming no node
export const getAdjacentBlockNodePointer = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  children: BlockChildren<TNode>,
  nodePointer: string,
  offset: number,
): string | undefined => {
  const rows = getBlockLayerRows(document, children);
  const index = rows.findIndex((row) => row.nodePointer === nodePointer);
  return index === -1 ? undefined : rows[index + offset]?.nodePointer;
};
