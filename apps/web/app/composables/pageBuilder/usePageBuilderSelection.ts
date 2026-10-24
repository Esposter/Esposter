import type { MaybeRefOrGetter } from "vue";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getParentNodeId } from "@/services/pageBuilder/getParentNodeId";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { getAdjacentBlockNodePointer, getBlockLayerRows } from "headless-block-editor";

// The selection the canvas's keys move through one open resource's webpage: the adjacent node in document order and the parent
export const usePageBuilderSelection = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getOpenDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
  // Up and Down select the adjacent node in document order, starting from the first node when none is selected, and stay put past either end
  const selectAdjacentNode = (offset: number) => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument(resourceIdValue);
    if (!open) return;

    const { document, kind } = open;
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
    const open = getOpenDocument(resourceIdValue);
    if (!open) return;

    const parentId = getParentNodeId(open.kind, open.document, getSelectedNodeId(resourceIdValue));
    setSelectedNodeId(resourceIdValue, parentId ?? "");
  };

  return { selectAdjacentNode, selectParent };
};
