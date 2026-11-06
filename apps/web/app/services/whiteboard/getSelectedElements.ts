import type { PositionedDocument, PositionedElement } from "vue-block-editor-headless";

// Every element a selection names, each with its index in the element list, in the order the list holds them
export const getSelectedElements = (
  document: PositionedDocument,
  selectedIds: string[],
): { element: PositionedElement; index: number }[] =>
  document.elements.flatMap((element, index) => (selectedIds.includes(element.id) ? [{ element, index }] : []));
