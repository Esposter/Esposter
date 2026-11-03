import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicNumber } from "#src/services/shared/checkIsSurveyLogicNumber";
import { takeOne } from "@esposter/shared";

// The digits after the point of a number-reading value, which a sum or a product is rounded to. A whole number has none
export const countSurveyLogicDecimals = (value: SurveyLogicValue): number => {
  if (!checkIsSurveyLogicNumber(value) || Math.floor(Number(value)) === value) return 0;

  const parts = String(value).split(".");
  return parts.length > 1 ? takeOne(parts, 1).length : 0;
};
