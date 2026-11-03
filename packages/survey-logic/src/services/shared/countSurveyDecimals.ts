import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";

// The decimal places in a value's text, which a sum trims its float error to, as SurveyJS does. Only a number or a text
// Has any
export const countSurveyDecimals = (value: SurveyLogicValue): number => {
  if (typeof value !== "number" && typeof value !== "string") return 0;
  if (Number.isNaN(getSurveyNumber(value))) return 0;
  if (typeof value === "number" && Number.isInteger(value)) return 0;

  const [, decimals = ""] = String(value).split(".");
  return decimals.length;
};
