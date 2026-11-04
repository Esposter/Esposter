import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// A text is a number only when it is a plain decimal once trimmed: an optional sign, digits with an optional point and digits after it (or a point and digits alone), and an optional exponent.
// A hexadecimal, binary or octal text, a comma decimal and any other text stay text
const NUMBER_TEXT_REGEX = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/iu;

// The number a value reads as, or undefined when it reads as none. A number is itself while it is finite.
// A list, a record, a boolean and an unanswered value read as no number
export const toSurveyLogicNumber = (value: SurveyLogicValue): number | undefined => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const text = value.trim();
  if (!NUMBER_TEXT_REGEX.test(text)) return undefined;

  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
};
