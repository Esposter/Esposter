import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getHoldingSlotPointers } from "#src/services/pageBuilder/getHoldingSlotPointers";
import { getBlockNode, getBlockPropPointer, getBlockTypeDefinition } from "vue-block-editor-headless";

// The pointers of the slots a node holds its own children in, then the slot holding the node and each ancestor's slot in turn
export const getCandidateSlotPointers: PageBuilderHelper<string[], [nodePointer: string]> = (
  kind,
  document,
  nodePointer,
) => {
  const node = getBlockNode(document, nodePointer, kind.children);
  const ownSlotPointers = Object.keys(getBlockTypeDefinition(kind.registry, node?.type ?? "")?.slots ?? {}).map(
    (slot) => getBlockPropPointer(nodePointer, slot),
  );
  return [...ownSlotPointers, ...getHoldingSlotPointers(nodePointer)];
};
