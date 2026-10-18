import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { getBlockNode } from "#src/services/getBlockNode";
import { removeBlockNode } from "#src/services/removeBlockNode";
import { JsonPatchOperationType } from "@esposter/shared";

// A move is a remove and an add of the same node, refused when the target slot does not accept its type or sits inside it
export const moveBlockNode = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodePointer: string,
  slotPointer: string,
  index: number,
): JsonPatchOperation[] => {
  const node = getBlockNode(document, nodePointer);
  if (
    !node ||
    slotPointer.startsWith(`${nodePointer}/`) ||
    !getAcceptedTypes(document, registry, slotPointer).includes(node.type)
  )
    return [];
  return [
    ...removeBlockNode(nodePointer),
    { op: JsonPatchOperationType.Add, path: `${slotPointer}/${index}`, value: node },
  ];
};
