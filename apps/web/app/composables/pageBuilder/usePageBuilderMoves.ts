import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { UiCommand } from "@/models/ui/UiCommand";
import type { UiCommandScope } from "@/models/ui/UiCommandScope";
import type { JsonPatchOperation } from "@esposter/shared";
import type { MaybeRefOrGetter } from "vue";

import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
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

// The move of a node to the index one away from it in its own slot, or none when no sibling sits at that index
const getSiblingMoveOperations = (
  kind: WebpageKind,
  document: WebpageDocument,
  nodePointer: string,
  offset: number,
): JsonPatchOperation[] => {
  const segments = parseJsonPointer(nodePointer);
  const slotPointer = getNodeSlotPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (
    index === undefined ||
    index + offset < 0 ||
    !getBlockNode(document, `${slotPointer}/${index + offset}`, kind.children)
  )
    return [];

  return moveBlockNode(document, kind.registry, kind.children, nodePointer, slotPointer, index + offset);
};

// The keyboard and command moves of the selected node in one open resource's webpage: Alt with an arrow moves it among
// Its siblings or into and out of a container, Move to moves it to the end of any slot that accepts it, and Delete removes
// It. Each edit is one history entry, and a move keeps the node selected; focus is the caller's to move. Each landed edit is
// Announced once through announce
export const usePageBuilderMoves = (resourceId: MaybeRefOrGetter<string>, announce: (message: string) => void) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getOpenDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  // The document, its kind and the node the selection holds, or none when nothing is selected or the node is gone
  const getSelection = () => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument(resourceIdValue);
    const nodeId = getSelectedNodeId(resourceIdValue);
    if (!open || !nodeId) return undefined;

    const nodePointer = getNodePointer(open.kind, open.document, nodeId);
    return nodePointer === undefined ? undefined : { ...open, nodeId, nodePointer };
  };
  // Announces where a moved node now sits: its title, its 1-based position among its slot's children and the slot's path
  const announceMove = (kind: WebpageKind, document: WebpageDocument, nodePointer: string) => {
    const segments = parseJsonPointer(nodePointer);
    const slotSegments = segments.slice(0, -1);
    const siblings = readJsonValue(document, slotSegments);
    const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
    const title = getNodeTitle(kind, document, segments);
    if (!title || !Array.isArray(siblings) || index === undefined) return;

    const path = getSlotPath(kind, document, toJsonPointer(slotSegments));
    announce(`Moved ${title} to position ${index + 1} of ${siblings.length} in ${path}`);
  };
  // Applies the operations a move makes to the selected node, and keeps that node selected once the edit lands
  const moveSelected = (
    label: string,
    getOperations: (kind: WebpageKind, document: WebpageDocument, nodePointer: string) => JsonPatchOperation[],
  ) => {
    const selection = getSelection();
    if (!selection) return;

    const operations = getOperations(selection.kind, selection.document, selection.nodePointer);
    if (operations.length === 0) return;

    applyEdit(toValue(resourceId), operations, label).match(() => {
      setSelectedNodeId(toValue(resourceId), selection.nodeId);
      const moved = getSelection();
      if (moved) announceMove(moved.kind, moved.document, moved.nodePointer);
    }, console.error);
  };
  const moveDown = () =>
    moveSelected("Move block", (kind, document, nodePointer) =>
      getSiblingMoveOperations(kind, document, nodePointer, 1),
    );
  const moveUp = () =>
    moveSelected("Move block", (kind, document, nodePointer) =>
      getSiblingMoveOperations(kind, document, nodePointer, -1),
    );
  const moveRight = () =>
    moveSelected("Move block", (kind, document, nodePointer) =>
      moveIntoPreviousSibling(document, kind.registry, kind.children, nodePointer),
    );
  const moveLeft = () =>
    moveSelected("Move block", (kind, document, nodePointer) =>
      moveOutAfterParent(document, kind.registry, kind.children, nodePointer),
    );
  const moveTo = (slotPointer: string) =>
    moveSelected("Move to", (kind, document, nodePointer) => {
      const children = readJsonValue(document, parseJsonPointer(slotPointer));
      const nodeSlotPointer = getNodeSlotPointer(nodePointer);
      // A node taken out of its own slot leaves that slot one shorter, so the end of it is one index less
      const childCount = Array.isArray(children) ? children.length - (slotPointer === nodeSlotPointer ? 1 : 0) : 0;
      return moveBlockNode(document, kind.registry, kind.children, nodePointer, slotPointer, childCount);
    });
  // Each slot that accepts the selected node, named by its path, so Move to is one search rather than a chain of Alt presses
  const moveToScope: UiCommandScope = {
    commands: () => {
      const selection = getSelection();
      if (!selection) return [];

      return getAcceptingSlotPointers(
        selection.document,
        selection.kind.registry,
        selection.kind.children,
        selection.nodePointer,
      ).map((slotPointer): UiCommand => ({
        group: PAGE_BUILDER_COMMAND_GROUP,
        id: `page-builder-move-to${slotPointer}`,
        meaning: UiIconMeaning.ArrowRight,
        run: () => moveTo(slotPointer),
        title: getSlotPath(selection.kind, selection.document, slotPointer),
      }));
    },
    placeholder: "Search slots",
    query: ref(""),
    title: "Move to",
  };
  // The copy is the node placed straight after the selected one in its slot, so it is selected and announced once it lands
  const duplicateSelected = () => {
    const selection = getSelection();
    if (!selection) return;

    const operations = duplicateBlockNode(
      selection.document,
      selection.kind.registry,
      selection.kind.children,
      webpageNodeSchema,
      selection.nodePointer,
    );
    const segments = parseJsonPointer(selection.nodePointer);
    const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
    if (operations.length === 0 || index === undefined) return;

    const title = getNodeTitle(selection.kind, selection.document, segments);
    applyEdit(toValue(resourceId), operations, "Duplicate block").match(() => {
      const copyPointer = `${getNodeSlotPointer(selection.nodePointer)}/${index + 1}`;
      const copied = getOpenDocument(toValue(resourceId));
      setSelectedNodeId(toValue(resourceId), copied ? getNodeIdAt(copied.kind, copied.document, copyPointer) : "");
      if (title) announce(`Duplicated ${title}`);
    }, console.error);
  };
  // Focus lands where getFocusAfterRemoval says, found in the document the removal leaves; the root's empty pointer clears the selection.
  // Returns whether the removal landed, so a caller announcing the delete knows a node was actually removed
  const deleteNode = (nodeId: string) => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument(resourceIdValue);
    const nodePointer = open && getNodePointer(open.kind, open.document, nodeId);
    if (!open || nodePointer === undefined) return false;

    const { document, kind } = open;
    const focusPointer = getFocusAfterRemoval(document, kind.children, nodePointer);
    const title = getNodeTitle(kind, document, parseJsonPointer(nodePointer));
    return applyEdit(resourceIdValue, removeBlockNode(nodePointer), "Delete block").match(
      () => {
        const focus = getOpenDocument(resourceIdValue);
        setSelectedNodeId(resourceIdValue, focus ? getNodeIdAt(focus.kind, focus.document, focusPointer) : "");
        if (title) announce(`Deleted ${title}`);
        return true;
      },
      (error) => {
        console.error(error);
        return false;
      },
    );
  };
  const deleteSelected = () => {
    const nodeId = getSelectedNodeId(toValue(resourceId));
    if (nodeId) deleteNode(nodeId);
  };

  return { deleteNode, deleteSelected, duplicateSelected, moveDown, moveLeft, moveRight, moveTo, moveToScope, moveUp };
};
