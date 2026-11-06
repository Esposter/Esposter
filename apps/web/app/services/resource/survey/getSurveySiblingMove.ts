import type { SurveyNodeMove } from "@/models/resource/survey/SurveyNodeMove";
import type { SurveyDocument } from "headless-survey-engine";

import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { getSiblingMoveOperations } from "vue-block-editor-headless";
import { surveyNodeChildren, surveyRegistry } from "headless-survey-engine";

// The move of a node to the index an offset away from it in its own slot: one back for a move up, one on for a move down. The core's
// command gives the operations, and none when no sibling sits there, which is refused with the reason the element is first or last
export const getSurveySiblingMove = (document: SurveyDocument, nodePointer: string, offset: number): SurveyNodeMove => {
  const operations = getSiblingMoveOperations(document, surveyRegistry, surveyNodeChildren, nodePointer, offset);
  if (operations.length > 0) return { operations, refusal: "" };

  if (getSurveyNodeLocation(nodePointer) === undefined) return { operations, refusal: "There is no element to move" };

  return { operations, refusal: offset < 0 ? "It is first in its slot" : "It is last in its slot" };
};
