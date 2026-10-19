import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getBlockNode } from "#src/services/getBlockNode";
import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getParsedSlotNodes } from "#src/services/getParsedSlotNodes";
import { getSlotTypes } from "#src/services/getSlotTypes";
import { moveBlockNode } from "#src/services/moveBlockNode";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// Moves a node to the end of the first slot of its previous sibling that accepts its type, or no operations when none does
export const moveIntoPreviousSibling = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
  nodePointer: string,
): JsonPatchOperation[] => {
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  const node = getBlockNode(document, nodePointer);
  if (!node || index === undefined || index === 0) return [];

  const previousPointer = `${toJsonPointer(segments.slice(0, -1))}/${index - 1}`;
  const previous = getBlockNode(document, previousPointer);
  if (!previous) return [];

  const slots = getBlockTypeDefinition(registry, previous.type)?.slots ?? {};
  const slot = Object.keys(slots).find((key) => getSlotTypes(slots, key).includes(node.type));
  if (slot === undefined) return [];

  const slotPointer = getBlockPropPointer(previousPointer, slot);
  return moveBlockNode(document, registry, nodePointer, slotPointer, getParsedSlotNodes(previous, slot).length);
};
