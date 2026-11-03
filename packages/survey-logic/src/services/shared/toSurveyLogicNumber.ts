import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicListNumber } from "#src/services/shared/toSurveyLogicListNumber";
import { toSurveyLogicTextNumber } from "#src/services/shared/toSurveyLogicTextNumber";

// The number a value reads as, or NaN, as SurveyJS reads it.
// A text and a list each read by their own rules, and a number is itself unless it is not finite.
// A boolean or an unanswered value is no number
export const toSurveyLogicNumber = (value: SurveyLogicValue): number => {
  if (typeof value === "string") return toSurveyLogicTextNumber(value);
  if (Array.isArray(value)) return toSurveyLogicListNumber(value);

  return typeof value === "number" && Number.isFinite(value) ? value : Number.NaN;
};
