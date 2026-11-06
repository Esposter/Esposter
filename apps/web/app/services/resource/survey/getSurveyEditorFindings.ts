import type { EditorFinding } from "@/models/editor/EditorFinding";
import type { SurveyDocument } from "headless-survey-engine";

import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";
import { checkSurveyDocument, surveyNodeChildren } from "headless-survey-engine";

// The survey check's issues as the findings an editor lists. The check refuses a save while any issue stands, so every
// Issue is an error. An issue names the node its field sits in by the node's id, read against this document as it is now:
// A pointer goes stale once its node moves, and an id does not. A calculated value's issue sits under the root, which no
// Node holds, so it names none
export const getSurveyEditorFindings = (document: SurveyDocument): EditorFinding[] => {
  // Rows come in document order, so a node's row precedes the rows beneath it, and the last row an issue sits under is
  // Its deepest node
  const nodePointers = getBlockLayerRows(document, surveyNodeChildren).map(({ nodePointer }) => nodePointer);
  return checkSurveyDocument(document).map(({ message, pointer }) => {
    const nodePointer = nodePointers.findLast((candidate) => pointer.startsWith(`${candidate}/`));
    const node = nodePointer === undefined ? undefined : getBlockNode(document, nodePointer, surveyNodeChildren);
    return { message, nodeId: node?.props.id || "", severity: EditorFindingSeverity.Error };
  });
};
