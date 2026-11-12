import type { Bounds, PositionedDocument } from "vue-block-editor-headless";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";
import { getBoundsCorners, getElementBounds, getPointsBounds } from "vue-block-editor-headless";

// The box that covers the bounds of every selected element, or undefined when no selected element is in the document. An arrow's bounds are its
// Route and a stroke's are its points, so each takes its own box as it draws
export const getSelectionBounds = (document: PositionedDocument, elementIds: string[]): Bounds | undefined => {
  const elementBounds = elementIds.flatMap((elementId) => {
    const index = getElementIndexById(document, elementId);
    return index === undefined ? [] : [getElementBounds(takeOne(document.elements, index))];
  });
  if (elementBounds.length === 0) return undefined;

  return getPointsBounds(elementBounds.flatMap((bounds) => getBoundsCorners(bounds)));
};
