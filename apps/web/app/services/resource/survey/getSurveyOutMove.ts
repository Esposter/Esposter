import type { SurveyNodeMove } from "@/models/resource/survey/SurveyNodeMove";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { moveOutAfterParent } from "vue-block-editor-headless";
import { surveyNodeChildren, surveyRegistry } from "vue-survey-engine-headless";

// The move of a node to just after its parent, in the slot that holds the parent. Refused at the top level, where a page has no parent to
// move out of, and where the slot around the parent does not take the node
export const getSurveyOutMove = (document: SurveyDocument, nodePointer: string): SurveyNodeMove => {
  const operations = moveOutAfterParent(document, surveyRegistry, surveyNodeChildren, nodePointer);
  if (operations.length > 0) return { operations, refusal: "" };

  const isTopLevel = getSurveyNodeLocation(nodePointer)?.slotPointer === "/content";
  return {
    operations,
    refusal: isTopLevel ? "It is already at the top level" : "The slot around its parent does not take it",
  };
};
