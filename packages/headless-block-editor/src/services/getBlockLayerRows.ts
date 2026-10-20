import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockLayerRow } from "#src/models/BlockLayerRow";
import type { BlockNode } from "#src/models/BlockNode";

import { getBlockPropPointer } from "#src/services/getBlockPropPointer";

// The rows of a list of children one depth down: each child's row, then the rows of its slots in the order its port returns them
// The slot keys are the port's, since a row lists the children a node holds; the accepting-slot search reads the registry's slot lists instead
const getChildRows = <TNode extends BlockNode>(
  children: BlockChildren<TNode>,
  nodes: readonly TNode[],
  listPointer: string,
  depth: number,
): BlockLayerRow[] =>
  nodes.flatMap((node, index) => {
    const nodePointer = `${listPointer}/${index}`;
    const slotRows = Object.entries(children(node)).flatMap(([slot, slotNodes]) =>
      getChildRows(children, slotNodes, getBlockPropPointer(nodePointer, slot), depth + 1),
    );
    return [{ depth, nodePointer, type: node.type }, ...slotRows];
  });

// Every node of a document in document order: a node's row comes before the rows of its slots, and the root's content is depth 0
export const getBlockLayerRows = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  children: BlockChildren<TNode>,
): BlockLayerRow[] => getChildRows(children, document.content, "/content", 0);
