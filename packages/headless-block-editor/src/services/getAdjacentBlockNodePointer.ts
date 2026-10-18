import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getBlockLayerRows } from "#src/services/getBlockLayerRows";

// The pointer of the node offset rows from a node in the layer rows, or undefined past either end or for a pointer naming no node
export const getAdjacentBlockNodePointer = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodePointer: string,
  offset: number,
): string | undefined => {
  const rows = getBlockLayerRows(document, registry);
  const index = rows.findIndex((row) => row.nodePointer === nodePointer);
  return index === -1 ? undefined : rows[index + offset]?.nodePointer;
};
