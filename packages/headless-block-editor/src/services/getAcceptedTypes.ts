import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getBlockNode } from "#src/services/getBlockNode";
import { parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The types a slot accepts: the root's content accepts every registry type, and a node's slot the types its definition allows
// Or none when the pointer names no slot of a node
export const getAcceptedTypes = (document: BlockDocument, registry: BlockRegistry, slotPointer: string): string[] => {
  if (slotPointer === "/content") return registry.map(({ type }) => type);

  const segments = parseJsonPointer(slotPointer);
  const owner = getBlockNode(document, toJsonPointer(segments.slice(0, -2)));
  const slot = segments.at(-1);
  if (!owner || slot === undefined) return [];

  return registry.find(({ type }) => type === owner.type)?.slots[slot] ?? [];
};
