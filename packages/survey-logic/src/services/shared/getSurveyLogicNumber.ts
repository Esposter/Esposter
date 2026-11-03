import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

const DIGITS_ONLY_REGEX = /^\d+$/u;
// SurveyJS reads a run of more than fifteen digits as text, so a long identifier stays text
const MAX_DIGITS_AS_NUMBER = 15;

// The number a value reads as, or undefined where it reads as no number: a number, or a string SurveyJS would read as one
export const getSurveyLogicNumber = (value: SurveyLogicValue): number | undefined => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (text === "" || (text.length > MAX_DIGITS_AS_NUMBER && DIGITS_ONLY_REGEX.test(text))) return undefined;

  // A decimal comma reads as a point, as SurveyJS reads a numeric answer typed with one
  const parsedNumber = Number(text.replace(",", "."));

  return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
};
