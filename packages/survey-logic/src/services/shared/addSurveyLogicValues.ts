import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicPrimitive } from "#src/services/shared/toSurveyLogicPrimitive";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// JavaScript's `+` on the values.
// A text on either side joins the two as text, a list reads as its text first, and anything else adds as numbers
export const addSurveyLogicValues = (left: SurveyLogicValue, right: SurveyLogicValue): SurveyLogicValue => {
  const leftPrimitive = toSurveyLogicPrimitive(left);
  const rightPrimitive = toSurveyLogicPrimitive(right);
  if (typeof leftPrimitive === "string" || typeof rightPrimitive === "string")
    return toSurveyLogicText(leftPrimitive) + toSurveyLogicText(rightPrimitive);

  return Number(leftPrimitive) + Number(rightPrimitive);
};
