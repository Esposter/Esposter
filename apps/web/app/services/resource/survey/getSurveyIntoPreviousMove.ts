import type { SurveyNodeMove } from "@/models/resource/survey/SurveyNodeMove";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { moveIntoPreviousSibling } from "vue-block-editor-headless";
import { surveyNodeChildren, surveyRegistry } from "vue-survey-engine-headless";

// The move of a node to the end of the first slot of the element before it that takes its kind. Refused when nothing sits before the node,
// and when the element before it holds no slot that takes the node
export const getSurveyIntoPreviousMove = (document: SurveyDocument, nodePointer: string): SurveyNodeMove => {
  const operations = moveIntoPreviousSibling(document, surveyRegistry, surveyNodeChildren, nodePointer);
  if (operations.length > 0) return { operations, refusal: "" };

  const location = getSurveyNodeLocation(nodePointer);
  const isFirst = location === undefined || location.index === 0;
  return { operations, refusal: isFirst ? "There is no element before it" : "The element before it cannot hold it" };
};
