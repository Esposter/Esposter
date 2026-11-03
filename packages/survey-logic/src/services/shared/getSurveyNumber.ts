import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The number a value reads as, by SurveyJS's rules, which the functions and the evaluator's coercion share. A text reads
// As a number only when all of it is one, so `12abc` is not, while `1,5` is 1.5 and `0x1F` is 31. A list or a record is
// Not a number, since a text cannot hold one whole
export const getSurveyNumber = (value: SurveyLogicValue): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value !== "string") return Number.NaN;

  const text = value.trim();
  if (!text) return Number.NaN;
  if (text.startsWith("0x")) return text.length > 32 ? Number.NaN : Number.parseInt(text, 16);
  // A long run of digits is an identifier rather than a number, since a double cannot hold all of it
  if (text.length > 15 && /^\d+$/u.test(text)) return Number.NaN;

  const decimalText = text.split(",").length === 2 ? text.replace(",", ".") : text;
  const number = Number(decimalText);
  if (!Number.isFinite(number)) return Number.NaN;

  // SurveyJS reads the digits with parseFloat, which stops at the zero of a binary, octal or upper-case hexadecimal text
  return /^0[box]/iu.test(decimalText) ? 0 : number;
};
