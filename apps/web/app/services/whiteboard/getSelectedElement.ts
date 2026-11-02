import type { PositionedDocument, PositionedElement } from "headless-block-editor";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";

// The element a selection names when exactly one is selected, with its index in the element list. Several selected, or none, name no element
export const getSelectedElement = (
  document: PositionedDocument,
  selectedIds: string[],
): undefined | { element: PositionedElement; index: number } => {
  const [selectedId] = selectedIds;
  if (selectedIds.length !== 1 || selectedId === undefined) return undefined;
  const index = getElementIndexById(document, selectedId);
  return index === undefined ? undefined : { element: takeOne(document.elements, index), index };
};
