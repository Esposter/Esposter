import type { JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument, PositionedElementProperty } from "vue-block-editor-headless";

import { getSelectedElements } from "#src/services/whiteboard/getSelectedElements";
import { updatePositionedElementProperty } from "vue-block-editor-headless";

// The operations that apply a look to every selected element, change by change. The holding rule decides each one, so an element takes only the
// Fields its kind holds, and an element that holds none of them contributes no operations
export const getWhiteboardStyleOperations = (
  document: PositionedDocument,
  selectedIds: string[],
  style: PositionedElementProperty[],
): JsonPatchOperation[] =>
  getSelectedElements(document, selectedIds).flatMap(({ index }) =>
    style.flatMap((change) => updatePositionedElementProperty(document, index, change)),
  );
