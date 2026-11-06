import { getSelectedElement } from "@/services/whiteboard/getSelectedElement";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The one element selected on the open whiteboard with its index in the document, or nothing while none or several are selected.
// Each properties panel the layout keys to a selection kind reads it, so a panel draws only while an element is there
export const useWhiteboardSelectedElement = () => {
  const whiteboardStore = useWhiteboardStore();
  const { editState } = storeToRefs(whiteboardStore);
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { selectedIds } = storeToRefs(whiteboardEditorStore);
  return computed(() => getSelectedElement(editState.value.document, selectedIds.value));
};
