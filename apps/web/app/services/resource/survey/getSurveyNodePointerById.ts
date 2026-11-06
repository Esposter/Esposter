import type { SurveyDocument } from "headless-survey-engine";

import { getBlockLayerRows, getBlockNode } from "vue-block-editor-headless";
import { surveyNodeChildren } from "headless-survey-engine";

// The pointer of the node an id names, read off the document's rows in layer order, or "" when no node holds the id
export const getSurveyNodePointerById = (document: SurveyDocument, id: string) =>
  getBlockLayerRows(document, surveyNodeChildren).find(
    ({ nodePointer }) => getBlockNode(document, nodePointer, surveyNodeChildren)?.props.id === id,
  )?.nodePointer ?? "";
