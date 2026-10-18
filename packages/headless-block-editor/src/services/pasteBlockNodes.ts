import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { createBlockNodesSchema } from "#src/services/createBlockNodesSchema";
import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { remintBlockNode } from "#src/services/remintBlockNode";
import { JsonPatchOperationType } from "@esposter/shared";

// Adds copies of the nodes, each with fresh ids, at an index of a slot, or none when the slot or the registry refuses them
// The copies are checked as the slot's children, not as the root's content; the node limit is the consumer's to check
export const pasteBlockNodes = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodes: BlockNode[],
  slotPointer: string,
  index: number,
): JsonPatchOperation[] => {
  const copies = nodes.map((node) => remintBlockNode(registry, node));
  const acceptedTypes = getAcceptedTypes(document, registry, slotPointer);
  if (!createBlockNodesSchema(registry, acceptedTypes).safeParse(copies).success) return [];

  return copies.map((copy, offset) => ({
    op: JsonPatchOperationType.Add,
    path: `${slotPointer}/${index + offset}`,
    value: copy,
  }));
};
