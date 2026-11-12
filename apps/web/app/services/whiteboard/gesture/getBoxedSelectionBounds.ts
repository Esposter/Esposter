import type { Bounds, PositionedDocument } from "vue-block-editor-headless";

import { getSelectionBounds } from "@/services/whiteboard/gesture/getSelectionBounds";
import { checkIsResizablePositionedElement } from "vue-block-editor-headless";

// The box that covers the boxes of the selected elements that take a size of their own, or undefined when none of them does. An arrow and a stroke
// Hold no box of their own, so they are left out of the box a move snaps by
export const getBoxedSelectionBounds = (document: PositionedDocument, elementIds: string[]): Bounds | undefined =>
  getSelectionBounds(
    document,
    document.elements
      .filter((element) => elementIds.includes(element.id) && checkIsResizablePositionedElement(element))
      .map((element) => element.id),
  );
