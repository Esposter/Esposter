import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { PositionedElement } from "#src/models/PositionedElement";

// The element at an index of the element list, or undefined when the index names none
export const getPositionedElement = (document: PositionedDocument, index: number): PositionedElement | undefined =>
  index >= 0 ? document.elements.at(index) : undefined;
