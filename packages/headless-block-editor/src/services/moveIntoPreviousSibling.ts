import type { LooseBlockDocument } from "#src/models/LooseBlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getBlockNode } from "#src/services/getBlockNode";
import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { getBlockPropValue } from "#src/services/getBlockPropValue";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getSlotTypes } from "#src/services/getSlotTypes";
import { moveBlockNode } from "#src/services/moveBlockNode";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// Moves a node to the end of the first slot of its previous sibling that accepts its type, or no operations when none does
export const moveIntoPreviousSibling = (
  document: LooseBlockDocument,
  registry: BlockRegistry,
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

  const children = getBlockPropValue(previous.props, slot);
  const childCount = Array.isArray(children) ? children.length : 0;
  const slotPointer = getBlockPropPointer(previousPointer, slot);
  return moveBlockNode(document, registry, nodePointer, slotPointer, childCount);
};
