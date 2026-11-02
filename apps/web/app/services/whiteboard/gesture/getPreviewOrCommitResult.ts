import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { JsonPatchOperation } from "@esposter/shared";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { applyPatches } from "@esposter/shared";

// A move previews the operations on the document, and a release commits them as one edit that ends the gesture
export const getPreviewOrCommitResult = (
  state: WhiteboardGestureState,
  operations: JsonPatchOperation[],
  action: GesturePointerAction.Move | GesturePointerAction.Up,
): WhiteboardGestureResult => {
  const document = applyPatches(state.document, operations).document;
  if (action === GesturePointerAction.Move) return { operations: [], state: { ...state, preview: document } };

  return { operations, state: { ...state, document, gesture: undefined, preview: undefined } };
};
