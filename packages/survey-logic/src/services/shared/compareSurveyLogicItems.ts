import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { compareSurveyLogicTexts } from "#src/services/shared/compareSurveyLogicTexts";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The order a list's items sort into: by each item's text in code point order, with an unanswered item last
export const compareSurveyLogicItems = (first: SurveyLogicValue, second: SurveyLogicValue): number => {
  if (first === undefined) return second === undefined ? 0 : 1;
  if (second === undefined) return -1;

  return compareSurveyLogicTexts(toSurveyLogicText(first), toSurveyLogicText(second));
};
