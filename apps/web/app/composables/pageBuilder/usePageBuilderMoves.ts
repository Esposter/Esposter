import type { UiCommand } from "@/models/ui/UiCommand";
import type { UiCommandScope } from "@/models/ui/UiCommandScope";
import type { JsonPatchOperation } from "@esposter/shared";
import type { BlockDocument } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { getSlotPath } from "@/services/pageBuilder/getSlotPath";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { parseArrayIndex, parseJsonPointer, readJsonValue, toJsonPointer } from "@esposter/shared";
import {
  duplicateBlockNode,
  getAcceptingSlotPointers,
  getBlockNode,
  getFocusAfterRemoval,
  moveBlockNode,
  moveIntoPreviousSibling,
  moveOutAfterParent,
  removeBlockNode,
} from "headless-block-editor";

// The id a node carries, or the empty id when the pointer names no node
const getNodeId = (document: BlockDocument | undefined, nodePointer: string | undefined): string => {
  if (!document || !nodePointer) return "";
  const id = getBlockNode(document, nodePointer)?.props.id;
  return typeof id === "string" ? id : "";
};

// The move of a node to the index one away from it in its own slot, or none when no sibling sits at that index
const getSiblingMoveOperations = (
  document: BlockDocument,
  nodePointer: string,
  offset: number,
): JsonPatchOperation[] => {
  const segments = parseJsonPointer(nodePointer);
  const slotPointer = getNodeSlotPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === undefined || index + offset < 0 || !getBlockNode(document, `${slotPointer}/${index + offset}`))
    return [];

  return moveBlockNode(document, webpageRegistry, nodePointer, slotPointer, index + offset);
};

// The keyboard and command moves of the selected node in one open resource's webpage: Alt with an arrow moves it among
// Its siblings or into and out of a container, Move to moves it to the end of any slot that accepts it, and Delete removes
// It. Each edit is one history entry, and a move keeps the node selected; focus is the caller's to move. Each landed edit is
// Announced once through announce
export const usePageBuilderMoves = (resourceId: MaybeRefOrGetter<string>, announce: (message: string) => void) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  // The document and the node the selection holds, or none when nothing is selected or the node is gone
  const getSelection = () => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument(resourceIdValue);
    const nodeId = getSelectedNodeId(resourceIdValue);
    if (!document || !nodeId) return undefined;

    const nodePointer = getNodePointer(document, nodeId);
    return nodePointer === undefined ? undefined : { document, nodeId, nodePointer };
  };
  // Announces where a moved node now sits: its title, its 1-based position among its slot's children and the slot's path
  const announceMove = (document: BlockDocument, nodePointer: string) => {
    const segments = parseJsonPointer(nodePointer);
    const slotSegments = segments.slice(0, -1);
    const siblings = readJsonValue(document, slotSegments);
    const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
    const title = getNodeTitle(document, segments);
    if (!title || !Array.isArray(siblings) || index === undefined) return;

    const path = getSlotPath(document, toJsonPointer(slotSegments));
    announce(`Moved ${title} to position ${index + 1} of ${siblings.length} in ${path}`);
  };
  // Applies the operations a move makes to the selected node, and keeps that node selected once the edit lands
  const moveSelected = (
    label: string,
    getOperations: (document: BlockDocument, nodePointer: string) => JsonPatchOperation[],
  ) => {
    const selection = getSelection();
    if (!selection) return;

    const operations = getOperations(selection.document, selection.nodePointer);
    if (operations.length === 0) return;

    applyEdit(toValue(resourceId), operations, label).match(() => {
      setSelectedNodeId(toValue(resourceId), selection.nodeId);
      const moved = getSelection();
      if (moved) announceMove(moved.document, moved.nodePointer);
    }, console.error);
  };
  const moveDown = () =>
    moveSelected("Move block", (document, nodePointer) => getSiblingMoveOperations(document, nodePointer, 1));
  const moveUp = () =>
    moveSelected("Move block", (document, nodePointer) => getSiblingMoveOperations(document, nodePointer, -1));
  const moveRight = () =>
    moveSelected("Move block", (document, nodePointer) =>
      moveIntoPreviousSibling(document, webpageRegistry, nodePointer),
    );
  const moveLeft = () =>
    moveSelected("Move block", (document, nodePointer) => moveOutAfterParent(document, webpageRegistry, nodePointer));
  const moveTo = (slotPointer: string) =>
    moveSelected("Move to", (document, nodePointer) => {
      const children = readJsonValue(document, parseJsonPointer(slotPointer));
      const nodeSlotPointer = getNodeSlotPointer(nodePointer);
      // A node taken out of its own slot leaves that slot one shorter, so the end of it is one index less
      const childCount = Array.isArray(children) ? children.length - (slotPointer === nodeSlotPointer ? 1 : 0) : 0;
      return moveBlockNode(document, webpageRegistry, nodePointer, slotPointer, childCount);
    });
  // Each slot that accepts the selected node, named by its path, so Move to is one search rather than a chain of Alt presses
  const moveToScope: UiCommandScope = {
    commands: () => {
      const selection = getSelection();
      if (!selection) return [];

      return getAcceptingSlotPointers(selection.document, webpageRegistry, selection.nodePointer).map(
        (slotPointer): UiCommand => ({
          group: PAGE_BUILDER_COMMAND_GROUP,
          id: `page-builder-move-to${slotPointer}`,
          meaning: UiIconMeaning.ArrowRight,
          run: () => moveTo(slotPointer),
          title: getSlotPath(selection.document, slotPointer),
        }),
      );
    },
    placeholder: "Search slots",
    query: ref(""),
    title: "Move to",
  };
  // The copy is the node placed straight after the selected one in its slot, so it is selected and announced once it lands
  const duplicateSelected = () => {
    const selection = getSelection();
    if (!selection) return;

    const operations = duplicateBlockNode(selection.document, webpageRegistry, selection.nodePointer);
    const segments = parseJsonPointer(selection.nodePointer);
    const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
    if (operations.length === 0 || index === undefined) return;

    const title = getNodeTitle(selection.document, segments);
    applyEdit(toValue(resourceId), operations, "Duplicate block").match(() => {
      const copyPointer = `${getNodeSlotPointer(selection.nodePointer)}/${index + 1}`;
      setSelectedNodeId(toValue(resourceId), getNodeId(getDocument(toValue(resourceId)), copyPointer));
      if (title) announce(`Duplicated ${title}`);
    }, console.error);
  };
  // Focus lands where getFocusAfterRemoval says, found in the document the removal leaves; the root's empty pointer clears the selection
  const deleteNode = (nodeId: string) => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument(resourceIdValue);
    const nodePointer = document && getNodePointer(document, nodeId);
    if (!document || nodePointer === undefined) return;

    const focusPointer = getFocusAfterRemoval(document, nodePointer);
    const title = getNodeTitle(document, parseJsonPointer(nodePointer));
    applyEdit(resourceIdValue, removeBlockNode(nodePointer), "Delete block").match(() => {
      setSelectedNodeId(resourceIdValue, getNodeId(getDocument(resourceIdValue), focusPointer));
      if (title) announce(`Deleted ${title}`);
    }, console.error);
  };
  const deleteSelected = () => {
    const nodeId = getSelectedNodeId(toValue(resourceId));
    if (nodeId) deleteNode(nodeId);
  };

  return { deleteNode, deleteSelected, duplicateSelected, moveDown, moveLeft, moveRight, moveTo, moveToScope, moveUp };
};
