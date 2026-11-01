import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockLayerRow } from "#src/models/BlockLayerRow";
import type { BlockNode } from "#src/models/BlockNode";

import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockSlots } from "#src/services/getBlockSlots";

// The rows of a list of children one depth down: each child's row, then the rows of its slots in the order its port returns them
// The slot keys are the port's, since a row lists the children a node holds; the accepting-slot search reads the registry's slot lists instead
export const getChildRows = <TNode extends BlockNode>(
  children: BlockChildren<TNode>,
  nodes: readonly TNode[],
  listPointer: string,
  depth: number,
): BlockLayerRow[] =>
  nodes.flatMap((node, index) => {
    const nodePointer = `${listPointer}/${index}`;
    const slotRows = Object.entries(getBlockSlots(children, node)).flatMap(([slot, slotNodes]) =>
      getChildRows(children, slotNodes, getBlockPropPointer(nodePointer, slot), depth + 1),
    );
    return [{ depth, nodePointer, type: node.type }, ...slotRows];
  });
