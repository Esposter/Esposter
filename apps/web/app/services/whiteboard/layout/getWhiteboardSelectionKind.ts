import type { PositionedDocument } from "headless-block-editor";

import { WHITEBOARD_SEVERAL_SELECTION_KIND } from "@/services/whiteboard/layout/constants";
import { getSelectedElement } from "@/services/whiteboard/getSelectedElement";

// The selection kind the layout's panels are keyed by: the one element's type, several for a selection of several, and "" for none
export const getWhiteboardSelectionKind = (document: PositionedDocument, selectedIds: string[]): string => {
  if (selectedIds.length > 1) return WHITEBOARD_SEVERAL_SELECTION_KIND;
  return getSelectedElement(document, selectedIds)?.element.type ?? "";
};
