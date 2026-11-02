import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";

import { reduceWhiteboardGesture } from "@/services/whiteboard/gesture/reduceWhiteboardGesture";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// Each pointer event is read by the gesture reducer over the stores' own document, selection, tool and viewport, and what it leaves is
// Written back to the stores: the gesture and its preview, the selection and the viewport. A release's operations are one edit, so they
// Are committed together, as one undo step
export const useWhiteboardGesture = () => {
  const whiteboardStore = useWhiteboardStore();
  const { commitOperations } = whiteboardStore;
  const { editState } = storeToRefs(whiteboardStore);
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { gesture, isSnapEnabled, preview, selectedIds, tool, viewport } = storeToRefs(whiteboardEditorStore);
  const onPointer = (event: GesturePointerEvent) => {
    const result = reduceWhiteboardGesture(
      {
        createId: () => crypto.randomUUID(),
        document: editState.value.document,
        gesture: gesture.value,
        isSnapEnabled: isSnapEnabled.value,
        preview: preview.value,
        selectedIds: selectedIds.value,
        tool: tool.value,
        viewport: viewport.value,
      },
      event,
    );
    gesture.value = result.state.gesture;
    preview.value = result.state.preview;
    selectedIds.value = result.state.selectedIds;
    viewport.value = result.state.viewport;
    if (result.operations.length > 0) commitOperations(result.operations);
  };
  return { onPointer };
};
