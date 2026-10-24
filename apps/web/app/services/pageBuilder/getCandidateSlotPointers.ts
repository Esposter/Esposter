import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getHoldingSlotPointers } from "@/services/pageBuilder/getHoldingSlotPointers";
import { getBlockNode, getBlockPropPointer, getBlockTypeDefinition } from "headless-block-editor";

// The pointers of the slots a node holds its own children in, then the slot holding the node and each ancestor's slot in turn
export const getCandidateSlotPointers = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  nodePointer: string,
): string[] => {
  const node = getBlockNode(document, nodePointer, kind.children);
  const ownSlotPointers = Object.keys(getBlockTypeDefinition(kind.registry, node?.type ?? "")?.slots ?? {}).map(
    (slot) => getBlockPropPointer(nodePointer, slot),
  );
  return [...ownSlotPointers, ...getHoldingSlotPointers(nodePointer)];
};
