import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";

import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

// The editing of one open page builder document, which every arrangement of the builder shares: what a screen reader hears, the
// Keys, the history and style commands, and the drag from the palette or a merge field onto the canvas. An arrangement draws the
// Palette, the canvas and the rest, and passes them what this answers. The canvas is the template ref "canvas", and getRoot answers
// The element the layers tree sits in, which a text edit's end returns focus to. revealLayers shows the tree's tab before that, where
// The tree is a tab, since a tab's content is not in the DOM until it is shown
export const usePageBuilderEditor = (
  kind: AnyPageBuilderKind,
  resourceId: string,
  getRoot: () => HTMLElement | null | undefined,
  revealLayers: () => void,
) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getHeldDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getEditingNodeId } = pageBuilderCanvasStore;
  const getPageDocument = () => getHeldDocument(resourceId)?.document;
  // The one live region every announcement goes through. Clearing first lets a repeat of the same text be announced again
  const announcement = ref("");
  const announce = (message: string) => {
    announcement.value = "";
    nextTick(() => {
      announcement.value = message;
    });
  };
  // The node delete a toolbar asks for is held here, since the editor's keys are not bound while it asks
  const isDeleteOpen = ref(false);
  const { handleCanvasKeydown, handleEnterKeydown } = usePageBuilderKeyCommands(
    kind,
    getPageDocument,
    () => resourceId,
    announce,
    isDeleteOpen,
  );
  usePageBuilderHistoryCommands(() => resourceId);
  usePageBuilderStyleCommands(() => resourceId);
  const { dragPoint, draggedType, dropTarget, isDragging, refusal, startMergeFieldDrag, startPaletteDrag } =
    usePageBuilderDrag(kind, getPageDocument, () => resourceId, announce);
  // A refusal is announced as it begins, not on every move, since the ghost showing it follows the pointer
  watch(refusal, (message) => {
    if (message) announce(message);
  });
  const canvas = useTemplateRef("canvas");
  // The canvas is mounted only once the page has content, so a palette drag on an empty page finds no frame and stays a click
  const getFrameGeometry = () => canvas.value?.getFrameGeometry();
  // Leaving a text edit returns focus to the node's row in the layers tree, since the edit held it inside the frame. A tab's
  // Content is not in the DOM until the tab is shown, so the tab is revealed first and the row is focused on the next tick
  watch(
    () => getEditingNodeId(resourceId),
    (nodeId, previousNodeId) => {
      if (nodeId || !previousNodeId) return;

      revealLayers();
      nextTick(() => {
        getRoot()
          ?.querySelector<HTMLElement>(`[role="treeitem"][data-item-id="${CSS.escape(previousNodeId)}"]`)
          ?.focus();
      });
    },
  );
  return {
    announce,
    announcement,
    dragPoint,
    draggedType,
    dropTarget,
    getFrameGeometry,
    getPageDocument,
    handleCanvasKeydown,
    handleEnterKeydown,
    isDeleteOpen,
    isDragging,
    refusal,
    startMergeFieldDrag,
    startPaletteDrag,
  };
};
