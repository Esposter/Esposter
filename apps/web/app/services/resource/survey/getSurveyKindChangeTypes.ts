import type { SurveyPlaceableNode } from "vue-survey-engine-headless";

import { SURVEY_ANSWERING_PALETTE_TYPES } from "#src/services/resource/survey/constants";
import { convertSurveyNodeKind } from "vue-survey-engine-headless";

// The kinds a question's kind switch offers: the palette's answering kinds, other than its own, that the kind change can carry it into
export const getSurveyKindChangeTypes = (node: SurveyPlaceableNode) =>
  SURVEY_ANSWERING_PALETTE_TYPES.filter(
    (type) => type !== node.type && convertSurveyNodeKind(node, type) !== undefined,
  );
