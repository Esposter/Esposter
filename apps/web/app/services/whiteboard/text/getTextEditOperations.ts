import type { WhiteboardTextEdit } from "@/models/whiteboard/WhiteboardTextEdit";
import type { JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument } from "headless-block-editor";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";
import { getPositionedElementText, updatePositionedElementText } from "headless-block-editor";

// The operations that write a text edit's draft to its element, or none when the element is gone or already holds the draft as its text
export const getTextEditOperations = (
  document: PositionedDocument,
  textEdit: WhiteboardTextEdit,
): JsonPatchOperation[] => {
  const index = getElementIndexById(document, textEdit.elementId);
  if (index === undefined) return [];

  const element = takeOne(document.elements, index);
  if (getPositionedElementText(element) === textEdit.draft) return [];

  return updatePositionedElementText(document, index, textEdit.draft);
};
