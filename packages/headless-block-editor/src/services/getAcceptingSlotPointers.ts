import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { getBlockLayerRows } from "#src/services/getBlockLayerRows";
import { getBlockNode } from "#src/services/getBlockNode";
import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// Every slot in the document whose accepted types include the node's type: the root's content first, then each node's slots in layer-row order
// Never a slot inside the node itself, since a node cannot move into its own subtree, and none for a pointer naming no node
export const getAcceptingSlotPointers = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodePointer: string,
): string[] => {
  const node = getBlockNode(document, nodePointer);
  if (!node) return [];

  const slotPointers = [
    "/content",
    ...getBlockLayerRows(document, registry).flatMap((row) =>
      Object.keys(getBlockTypeDefinition(registry, row.type)?.slots ?? {}).map((slot) =>
        getBlockPropPointer(row.nodePointer, slot),
      ),
    ),
  ];
  return slotPointers.filter(
    (slotPointer) =>
      !slotPointer.startsWith(`${nodePointer}/`) &&
      getAcceptedTypes(document, registry, slotPointer).includes(node.type),
  );
};
