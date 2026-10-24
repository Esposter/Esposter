import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getHoldingSlotPointers } from "@/services/pageBuilder/getHoldingSlotPointers";
import { getBlockNode, getBlockPropPointer, getBlockTypeDefinition } from "headless-block-editor";

// The pointers of the slots a node holds its own children in, then the slot holding the node and each ancestor's slot in turn
export const getCandidateSlotPointers = (
  kind: WebpageKind,
  document: WebpageDocument,
  nodePointer: string,
): string[] => {
  const node = getBlockNode(document, nodePointer, kind.children);
  const ownSlotPointers = Object.keys(getBlockTypeDefinition(kind.registry, node?.type ?? "")?.slots ?? {}).map(
    (slot) => getBlockPropPointer(nodePointer, slot),
  );
  return [...ownSlotPointers, ...getHoldingSlotPointers(nodePointer)];
};
