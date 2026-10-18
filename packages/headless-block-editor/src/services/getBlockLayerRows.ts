import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockLayerRow } from "#src/models/BlockLayerRow";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// The rows of a list of children one depth down: each child's row, then the rows of its slots in the order its type declares them
// A child that is not a node, and a slot that is not a list, contribute nothing
const getChildRows = (
  registry: BlockRegistry,
  children: unknown[],
  listPointer: string,
  depth: number,
): BlockLayerRow[] =>
  children.flatMap((child, index) => {
    const result = blockNodeShapeSchema.safeParse(child);
    if (!result.success) return [];

    const { data: node } = result;
    const nodePointer = `${listPointer}/${index}`;
    const slotRows = Object.keys(getBlockTypeDefinition(registry, node.type)?.slots ?? {}).flatMap((slot) => {
      const slotChildren: unknown = node.props[slot];
      const slotPointer = getBlockPropPointer(nodePointer, slot);
      return Array.isArray(slotChildren) ? getChildRows(registry, slotChildren, slotPointer, depth + 1) : [];
    });
    return [{ depth, nodePointer, type: node.type }, ...slotRows];
  });

// Every node of a document in document order: a node's row comes before the rows of its slots, and the root's content is depth 0
export const getBlockLayerRows = (document: BlockDocument, registry: BlockRegistry): BlockLayerRow[] =>
  getChildRows(registry, document.content, "/content", 0);
