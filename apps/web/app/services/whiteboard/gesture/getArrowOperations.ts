import type { JsonPatchOperation } from "@esposter/shared";
import type { ArrowEnd, PositionedDocument } from "vue-block-editor-headless";

import { applyPatches } from "@esposter/shared";
import {
  ArrowEndKey,
  ArrowPathKind,
  bindPositionedArrowEnd,
  DashPattern,
  insertPositionedElement,
  PositionedElementType,
  SketchLevel,
  StrokeWidth,
} from "vue-block-editor-headless";

// The operations that add a straight arrow on top of the element list, inserted free and then bound at each end that took a binding.
// The insert and the binds are one edit, so an undo reverts the arrow and its bindings together. A new arrow is solid, at medium width, in
// The page's text colour
export const getArrowOperations = (
  document: PositionedDocument,
  elementId: string,
  start: ArrowEnd,
  end: ArrowEnd,
): JsonPatchOperation[] => {
  const index = document.elements.length;
  const insertOperations = insertPositionedElement(document, index, {
    color: "",
    dashPattern: DashPattern.Solid,
    end: { hasArrowhead: end.hasArrowhead, point: end.point },
    id: elementId,
    label: "",
    pathKind: ArrowPathKind.Straight,
    sketchLevel: SketchLevel.Artist,
    start: { hasArrowhead: start.hasArrowhead, point: start.point },
    strokeWidth: StrokeWidth.Medium,
    type: PositionedElementType.Arrow,
  });
  const insertedDocument = applyPatches(document, insertOperations).document;
  const startOperations =
    start.binding === undefined
      ? []
      : bindPositionedArrowEnd(insertedDocument, index, ArrowEndKey.Start, start.binding);
  const endOperations =
    end.binding === undefined ? [] : bindPositionedArrowEnd(insertedDocument, index, ArrowEndKey.End, end.binding);
  return [...insertOperations, ...startOperations, ...endOperations];
};
