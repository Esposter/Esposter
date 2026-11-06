import type { SurveyNodeMove } from "@/models/resource/survey/SurveyNodeMove";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { SurveyNodeMoveType } from "@/models/resource/survey/SurveyNodeMoveType";
import { getSurveyIntoPreviousMove } from "@/services/resource/survey/getSurveyIntoPreviousMove";
import { getSurveyOutMove } from "@/services/resource/survey/getSurveyOutMove";
import { getSurveySiblingMove } from "@/services/resource/survey/getSurveySiblingMove";
import { exhaustiveGuard } from "@esposter/shared";

// The move a node takes from its place. The creator's commands apply its operations and its menu reads its refusal, so the two come from
// the one place and cannot disagree
export const getSurveyNodeMove = (
  document: SurveyDocument,
  nodePointer: string,
  moveType: SurveyNodeMoveType,
): SurveyNodeMove => {
  switch (moveType) {
    case SurveyNodeMoveType.Down:
      return getSurveySiblingMove(document, nodePointer, 1);
    case SurveyNodeMoveType.IntoPrevious:
      return getSurveyIntoPreviousMove(document, nodePointer);
    case SurveyNodeMoveType.Out:
      return getSurveyOutMove(document, nodePointer);
    case SurveyNodeMoveType.Up:
      return getSurveySiblingMove(document, nodePointer, -1);
    default:
      return exhaustiveGuard(moveType);
  }
};
