import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { JsonPatchOperation } from "@esposter/shared";

// The state after a pointer event, and the operations a release committed, to be saved as one edit. Empty when nothing was committed
export interface WhiteboardGestureResult {
  operations: JsonPatchOperation[];
  state: WhiteboardGestureState;
}
