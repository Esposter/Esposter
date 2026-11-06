import type { PositionedDocument } from "vue-block-editor-headless";

// The index of the element with an id in the element list, or undefined when no element holds it
export const getElementIndexById = (document: PositionedDocument, elementId: string): number | undefined => {
  const index = document.elements.findIndex(({ id }) => id === elementId);
  return index === -1 ? undefined : index;
};
