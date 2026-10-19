import type { LooseBlockDocument } from "#src/models/LooseBlockDocument";
import type { LooseBlockNode } from "#src/models/LooseBlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { JsonPatchOperationType } from "@esposter/shared";

// Adds a node at an index of a slot, or no operations when the slot does not accept its type
export const insertBlockNode = (
  document: LooseBlockDocument,
  registry: BlockRegistry,
  slotPointer: string,
  index: number,
  node: LooseBlockNode,
): JsonPatchOperation[] => {
  if (!getAcceptedTypes(document, registry, slotPointer).includes(node.type)) return [];
  return [{ op: JsonPatchOperationType.Add, path: `${slotPointer}/${index}`, value: node }];
};
