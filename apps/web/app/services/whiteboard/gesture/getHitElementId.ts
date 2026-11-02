import type { Point, PositionedDocument } from "headless-block-editor";

import { takeOne } from "@esposter/shared";
import { getHitElementIndex } from "headless-block-editor";

// The id of the topmost element a point hits, or undefined when it hits none
export const getHitElementId = (document: PositionedDocument, point: Point, tolerance: number): string | undefined => {
  const index = getHitElementIndex(document, point, tolerance);
  return index === undefined ? undefined : takeOne(document.elements, index).id;
};
