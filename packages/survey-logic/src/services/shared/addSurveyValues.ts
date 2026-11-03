import { countSurveyDecimals } from "#src/services/shared/countSurveyDecimals";

// Adds one value to a running total with JavaScript's `+`, then trims the float error to the most decimal places either
// Side has, as SurveyJS does. A total that has become text has no digits to trim, and SurveyJS fails on it, so it is empty
export const addSurveyValues = (
  total: number | string,
  value: boolean | number | string,
): number | string | undefined => {
  const sum =
    typeof total === "number" && typeof value !== "string" ? total + Number(value) : String(total) + String(value);
  const decimals = Math.max(countSurveyDecimals(total), countSurveyDecimals(value));
  if (decimals === 0) return sum;

  return typeof sum === "number" ? Number(sum.toFixed(decimals)) : undefined;
};
