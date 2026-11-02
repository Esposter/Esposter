import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "headless-block-editor";

import { STROKE_WIDTH } from "@/services/whiteboard/gesture/constants";
import { insertPositionedElement, PositionedElementType } from "headless-block-editor";

// The operations that add a stroke through the points at the top of the element list, drawn last so it sits above what it crosses
export const getStrokeOperations = (
  document: PositionedDocument,
  elementId: string,
  points: Point[],
): JsonPatchOperation[] =>
  insertPositionedElement(document, document.elements.length, {
    id: elementId,
    points,
    strokeWidth: STROKE_WIDTH,
    type: PositionedElementType.Stroke,
  });
