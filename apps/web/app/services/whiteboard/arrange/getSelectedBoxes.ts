import type { Bounds, PositionedDocument } from "vue-block-editor-headless";

import { getSelectedElements } from "@/services/whiteboard/getSelectedElements";
import { checkIsResizablePositionedElement, getElementBounds } from "vue-block-editor-headless";

// The selected elements that take a size of their own, each with its index and its bounds, in the order of the element list. An arrow and a stroke
// Are left out, since align and distribute move boxes alone
export const getSelectedBoxes = (
  document: PositionedDocument,
  selectedIds: string[],
): { bounds: Bounds; index: number }[] =>
  getSelectedElements(document, selectedIds)
    .filter(({ element }) => checkIsResizablePositionedElement(element))
    .map(({ element, index }) => ({ bounds: getElementBounds(element), index }));
