import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { STROKE_WIDTH } from "@/services/whiteboard/gesture/constants";
import { insertPositionedElement, PositionedElementType } from "vue-block-editor-headless";

// The operations that add a stroke through the points at the top of the element list, drawn last so it sits above what it crosses. A stroke
// Starts in the page's text colour
export const getStrokeOperations = (
  document: PositionedDocument,
  elementId: string,
  points: Point[],
): JsonPatchOperation[] =>
  insertPositionedElement(document, document.elements.length, {
    color: "",
    id: elementId,
    points,
    strokeWidth: STROKE_WIDTH,
    type: PositionedElementType.Stroke,
  });
