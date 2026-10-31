import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getParentNodeId } from "@/services/pageBuilder/getParentNodeId";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { getAdjacentBlockNodePointer, getBlockLayerRows } from "headless-block-editor";

// The selection the canvas's keys move through one open resource's webpage: the adjacent node in document order and the parent
// The kind's signature, which each composable lists as its own inputs, so the duplicate-code gate skips it
// `jscpd:ignore-start`
export const usePageBuilderSelection = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  getDocument: () => TDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
) => {
  // `jscpd:ignore-end`
  const { getOpenDocument } = usePageBuilderSelectedNode(kind, getDocument, resourceId);
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
  // Up and Down select the adjacent node in document order, starting from the first node when none is selected, and stay put past either end
  const selectAdjacentNode = (offset: number) => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument();
    if (!open) return;

    const { document } = open;
    const nodeId = getSelectedNodeId(resourceIdValue);
    const nodePointer = nodeId ? getNodePointer(kind, document, nodeId) : undefined;
    const adjacentPointer =
      nodePointer === undefined
        ? getBlockLayerRows(document, kind.children)[0]?.nodePointer
        : getAdjacentBlockNodePointer(document, kind.children, nodePointer, offset);
    const adjacentId = adjacentPointer === undefined ? "" : getNodeIdAt(kind, document, adjacentPointer);
    if (adjacentId) setSelectedNodeId(resourceIdValue, adjacentId);
  };
  // Escape selects the parent of the selected node, or clears the selection when the node is at the root
  const selectParent = () => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument();
    if (!open) return;

    const parentId = getParentNodeId(kind, open.document, getSelectedNodeId(resourceIdValue));
    setSelectedNodeId(resourceIdValue, parentId ?? "");
  };

  return { selectAdjacentNode, selectParent };
};
