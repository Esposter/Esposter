import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { GestureWheelEvent } from "@/models/whiteboard/GestureWheelEvent";

import { reduceWhiteboardGesture } from "@/services/whiteboard/gesture/reduceWhiteboardGesture";
import { getWheelViewport } from "@/services/whiteboard/viewport/getWheelViewport";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// Each pointer event is read by the gesture reducer over the stores' own document, selection, tool and viewport, and what it leaves is
// Written back to the stores: the gesture and its preview, the tool, the selection and the viewport. A release's operations are one edit,
// So they are committed together, as one undo step. A commit the document refuses leaves the selection where it was. A wheel turn is not a
// Gesture, so it only moves the viewport
export const useWhiteboardGesture = () => {
  const whiteboardStore = useWhiteboardStore();
  const { commitOperations } = whiteboardStore;
  const { editState } = storeToRefs(whiteboardStore);
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { gesture, isSpaceHeld, isToolLocked, preview, selectedIds, shapeKind, tool, viewport } =
    storeToRefs(whiteboardEditorStore);
  const onPointer = (event: GesturePointerEvent) => {
    const result = reduceWhiteboardGesture(
      {
        createId: () => crypto.randomUUID(),
        document: editState.value.document,
        gesture: gesture.value,
        isSpaceHeld: isSpaceHeld.value,
        isToolLocked: isToolLocked.value,
        preview: preview.value,
        selectedIds: selectedIds.value,
        shapeKind: shapeKind.value,
        tool: tool.value,
        viewport: viewport.value,
      },
      event,
    );
    gesture.value = result.state.gesture;
    preview.value = result.state.preview;
    tool.value = result.state.tool;
    viewport.value = result.state.viewport;
    const isCommitted = result.operations.length === 0 || commitOperations(result.operations);
    if (isCommitted) selectedIds.value = result.state.selectedIds;
    // A refused commit leaves the document as it was, so a selection of copies an Alt press named, which the document never took, is left with what it holds
    else
      selectedIds.value = selectedIds.value.filter((id) =>
        editState.value.document.elements.some((element) => element.id === id),
      );
  };
  const onWheel = (event: GestureWheelEvent) => {
    viewport.value = getWheelViewport(viewport.value, event);
  };
  return { onPointer, onWheel };
};
