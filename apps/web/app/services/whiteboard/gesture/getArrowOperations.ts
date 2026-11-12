import type { JsonPatchOperation } from "@esposter/shared";
import type { Except } from "type-fest";
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
  TextSize,
} from "vue-block-editor-headless";

// The operations that add a straight arrow on top of the element list, inserted free and then bound at each end that took a binding.
// The insert and the binds are one edit, so an undo reverts the arrow and its bindings together. A new arrow is solid, at medium width, in
// The page's text colour, and each end takes the arrowhead it is given
// An end as the insert takes it, with the arrowhead it draws and none of the binding, which the binds that follow add
const getFreeEnd = ({ arrowhead, point }: ArrowEnd): Except<ArrowEnd, "binding"> =>
  arrowhead === undefined ? { point } : { arrowhead, point };

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
    end: getFreeEnd(end),
    id: elementId,
    label: "",
    pathKind: ArrowPathKind.Straight,
    sketchLevel: SketchLevel.Artist,
    start: getFreeEnd(start),
    strokeWidth: StrokeWidth.Medium,
    textSize: TextSize.Small,
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
