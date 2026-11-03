import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { STRING_QUOTES } from "#src/services/constants";
import { checkIsSurveyLogicBooleanText } from "#src/services/shared/checkIsSurveyLogicBooleanText";
import { checkIsSurveyLogicNumber } from "#src/services/shared/checkIsSurveyLogicNumber";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// The value an answer reads as, as SurveyJS reads one.
// A text spelling a boolean is that boolean, a text in quotes loses them, and a text that is a number is that number.
// A text with a leading zero stays text
export const toSurveyLogicAnswer = (value: SurveyLogicValue): SurveyLogicValue => {
  if (!value || typeof value !== "string") return value;
  if (checkIsSurveyLogicBooleanText(value)) return value.toLowerCase() === "true";
  if (
    value.length > 1 &&
    STRING_QUOTES.some((quote) => value.startsWith(quote)) &&
    STRING_QUOTES.some((quote) => value.endsWith(quote))
  )
    return value.slice(1, -1);
  if (!checkIsSurveyLogicNumber(value)) return value;

  const isLeadingZero = value.startsWith("0") && !value.startsWith("0x");
  if (isLeadingZero && value.length > 1 && ![".", ","].some((point) => value.startsWith(point, 1))) return value;

  return toSurveyLogicNumber(value);
};
