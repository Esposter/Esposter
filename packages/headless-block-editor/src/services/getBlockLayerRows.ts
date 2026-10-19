import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockLayerRow } from "#src/models/BlockLayerRow";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getParsedSlotNodes } from "#src/services/getParsedSlotNodes";

// The rows of a list of children one depth down: each child's row, then the rows of its slots in the order its type declares them
const getChildRows = <TNode extends BlockNode>(
  registry: BlockRegistry<TNode>,
  children: TNode[],
  listPointer: string,
  depth: number,
): BlockLayerRow[] =>
  children.flatMap((node, index) => {
    const nodePointer = `${listPointer}/${index}`;
    const slotRows = Object.keys(getBlockTypeDefinition(registry, node.type)?.slots ?? {}).flatMap((slot) =>
      getChildRows(registry, getParsedSlotNodes(node, slot), getBlockPropPointer(nodePointer, slot), depth + 1),
    );
    return [{ depth, nodePointer, type: node.type }, ...slotRows];
  });

// Every node of a document in document order: a node's row comes before the rows of its slots, and the root's content is depth 0
export const getBlockLayerRows = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
): BlockLayerRow[] => getChildRows(registry, document.content, "/content", 0);
