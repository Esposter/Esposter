import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { getBlockLayerRows } from "#src/services/getBlockLayerRows";
import { getBlockNode } from "#src/services/getBlockNode";
import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// Every slot whose accepted types include the node's type: the root's content first, then each node's slots.
// They come in layer-row order, and never include a slot inside the node itself.
// A node cannot move into its own subtree. The slot keys are the registry's, since acceptance is a registry fact.
// A pointer naming no node returns none.
export const getAcceptingSlotPointers = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
  children: BlockChildren<TNode>,
  nodePointer: string,
): string[] => {
  const node = getBlockNode(document, nodePointer, children);
  if (!node) return [];

  const slotPointers = [
    "/content",
    ...getBlockLayerRows(document, children).flatMap((row) =>
      Object.keys(getBlockTypeDefinition(registry, row.type)?.slots ?? {}).map((slot) =>
        getBlockPropPointer(row.nodePointer, slot),
      ),
    ),
  ];
  return slotPointers.filter(
    (slotPointer) =>
      !slotPointer.startsWith(`${nodePointer}/`) &&
      getAcceptedTypes(document, registry, children, slotPointer).includes(node.type),
  );
};
