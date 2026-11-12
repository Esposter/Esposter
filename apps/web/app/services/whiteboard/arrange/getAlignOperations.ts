import type { JsonPatchOperation } from "@esposter/shared";
import type { Bounds, Point, PositionedDocument } from "vue-block-editor-headless";

import { AlignEdge } from "@/models/whiteboard/AlignEdge";
import { WHITEBOARD_ALIGN_MINIMUM_BOXES } from "@/services/whiteboard/arrange/constants";
import { getSelectedBoxes } from "@/services/whiteboard/arrange/getSelectedBoxes";
import { getBoxedSelectionBounds } from "@/services/whiteboard/gesture/getBoxedSelectionBounds";
import { exhaustiveGuard } from "@esposter/shared";
import { movePositionedElement } from "vue-block-editor-headless";

// The point a box moves to so its edge or centre lines up with the same edge or centre of the selection's box, the other axis kept
const getAlignedPoint = (edge: AlignEdge, bounds: Bounds, selectionBounds: Bounds): Point => {
  switch (edge) {
    case AlignEdge.Bottom:
      return { x: bounds.x, y: selectionBounds.y + selectionBounds.height - bounds.height };
    case AlignEdge.Centre:
      return { x: selectionBounds.x + (selectionBounds.width - bounds.width) / 2, y: bounds.y };
    case AlignEdge.Left:
      return { x: selectionBounds.x, y: bounds.y };
    case AlignEdge.Middle:
      return { x: bounds.x, y: selectionBounds.y + (selectionBounds.height - bounds.height) / 2 };
    case AlignEdge.Right:
      return { x: selectionBounds.x + selectionBounds.width - bounds.width, y: bounds.y };
    case AlignEdge.Top:
      return { x: bounds.x, y: selectionBounds.y };
    default:
      return exhaustiveGuard(edge);
  }
};

// The operations that line each box of a selection up at one edge or centre of the selection's box. Each box moves through the move a drag uses,
// So an arrow bound to a moved box is rerouted in the same edit. A box already there is not moved, and an arrow or a stroke stays where it is
export const getAlignOperations = (
  document: PositionedDocument,
  selectedIds: string[],
  edge: AlignEdge,
): JsonPatchOperation[] => {
  const boxes = getSelectedBoxes(document, selectedIds);
  const selectionBounds = getBoxedSelectionBounds(document, selectedIds);
  if (boxes.length < WHITEBOARD_ALIGN_MINIMUM_BOXES || selectionBounds === undefined) return [];

  return boxes.flatMap(({ bounds, index }) => {
    const point = getAlignedPoint(edge, bounds, selectionBounds);
    return point.x === bounds.x && point.y === bounds.y ? [] : movePositionedElement(document, index, point);
  });
};
