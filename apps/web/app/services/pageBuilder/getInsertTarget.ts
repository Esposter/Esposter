import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getEmptyContainerSlotPointer } from "@/services/pageBuilder/getEmptyContainerSlotPointer";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { parseArrayIndex, parseJsonPointer } from "@esposter/shared";
import { getAcceptedTypes } from "headless-block-editor";

// Where a node of the type goes: the first slot of the selected container when that slot is empty and accepts the type,
// Else straight after the selected node in its own slot, or the end of the root's content when no node is selected
export const getInsertTarget = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  type: string,
  nodePointer: string | undefined,
) => {
  const containerSlotPointer =
    nodePointer === undefined ? undefined : getEmptyContainerSlotPointer(kind, document, nodePointer);
  if (
    containerSlotPointer !== undefined &&
    getAcceptedTypes(document, kind.registry, kind.children, containerSlotPointer).includes(type)
  )
    return { index: 0, slotPointer: containerSlotPointer };
  if (nodePointer === undefined) return { index: document.content.length, slotPointer: "/content" };

  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === undefined) return undefined;

  return { index: index + 1, slotPointer: getNodeSlotPointer(nodePointer) };
};
