import type { BlockDocument } from "headless-block-editor";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getHoldingSlotPointers } from "@/services/pageBuilder/getHoldingSlotPointers";
import { getBlockNode, getBlockPropPointer, getBlockTypeDefinition } from "headless-block-editor";

// The pointers of the slots a node holds its own children in, then the slot holding the node and each ancestor's slot in turn
export const getCandidateSlotPointers = (document: BlockDocument, nodePointer: string): string[] => {
  const node = getBlockNode(document, nodePointer);
  const ownSlotPointers = Object.keys(getBlockTypeDefinition(webpageRegistry, node?.type ?? "")?.slots ?? {}).map(
    (slot) => getBlockPropPointer(nodePointer, slot),
  );
  return [...ownSlotPointers, ...getHoldingSlotPointers(nodePointer)];
};
