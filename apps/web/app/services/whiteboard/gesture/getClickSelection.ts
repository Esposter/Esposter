import type { GesturePressed } from "@/models/whiteboard/GesturePressed";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

// The selection a press leaves when it is released without a drag: a plain press selects the element it landed on alone, or clears
// The selection on the canvas. Shift and a handle leave the selection as it is
export const getClickSelection = (state: WhiteboardGestureState, gesture: GesturePressed): string[] => {
  if (gesture.isAdditive || gesture.handle !== undefined) return state.selectedIds;

  return gesture.elementId ? [gesture.elementId] : [];
};
