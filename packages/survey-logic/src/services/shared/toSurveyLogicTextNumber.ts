import { checkIsSurveyLogicDigitsOnly } from "#src/services/shared/checkIsSurveyLogicDigitsOnly";
import { checkIsSurveyLogicStringOperator } from "#src/services/shared/checkIsSurveyLogicStringOperator";

// A text reads as a number as SurveyJS reads it: trimmed, and read in base 16 when it starts with 0x.
// A long run of digits, or a text with a multiplication, power, division or remainder sign, is no number.
// A text with exactly one comma reads the comma as its point. The length limit is SurveyJS's, past which digits lose precision
export const toSurveyLogicTextNumber = (value: string): number => {
  const text = value.trim();
  if (!text) return Number.NaN;
  if (text.startsWith("0x")) return text.length > 32 ? Number.NaN : Number.parseInt(text, 16);
  if (text.length > 15 && checkIsSurveyLogicDigitsOnly(text)) return Number.NaN;
  if (checkIsSurveyLogicStringOperator(text)) return Number.NaN;

  const decimalText = text.split(",").length === 2 ? text.replaceAll(",", ".") : text;
  const decimalNumber = Number(decimalText);
  return Number.isFinite(decimalNumber) ? decimalNumber : Number.NaN;
};
