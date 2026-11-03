import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The order JavaScript's default sort gives a list: by each item's text, with an unanswered item last
export const compareSurveyLogicItems = (first: SurveyLogicValue, second: SurveyLogicValue): number => {
  if (first === undefined) return second === undefined ? 0 : 1;
  if (second === undefined) return -1;

  const firstText = toSurveyLogicText(first);
  const secondText = toSurveyLogicText(second);
  if (firstText === secondText) return 0;

  return firstText < secondText ? -1 : 1;
};
