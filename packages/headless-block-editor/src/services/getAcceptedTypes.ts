import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { getBlockNode } from "#src/services/getBlockNode";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getRootAcceptedTypes } from "#src/services/getRootAcceptedTypes";
import { getSlotTypes } from "#src/services/getSlotTypes";
import { parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The types a slot accepts: the content types the registry's root declares for the root, and a node's slot the types its definition allows
// Or none when the pointer names no slot of a node
export const getAcceptedTypes = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
  slotPointer: string,
): string[] => {
  if (slotPointer === "/content") return getRootAcceptedTypes(registry);

  const segments = parseJsonPointer(slotPointer);
  const owner = getBlockNode(document, toJsonPointer(segments.slice(0, -2)));
  const slot = segments.at(-1);
  if (!owner || slot === undefined) return [];

  return getSlotTypes(getBlockTypeDefinition(registry, owner.type)?.slots ?? {}, slot);
};
