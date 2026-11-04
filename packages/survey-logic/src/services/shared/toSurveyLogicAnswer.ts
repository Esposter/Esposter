import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { STRING_QUOTES } from "#src/services/constants";
import { checkIsSurveyLogicBooleanText } from "#src/services/shared/checkIsSurveyLogicBooleanText";

// The value an answer reads as, at every depth. A null the storage holds is unanswered, so no expression reads one.
// A text spelling a boolean is that boolean, and a text in quotes loses them.
// Any other text stays text: an operation reads it as a number only where it asks for one
export const toSurveyLogicAnswer = (value: SurveyLogicStoredValue): SurveyLogicValue => {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map((item) => toSurveyLogicAnswer(item));
  if (typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([name, field]) => [name, toSurveyLogicAnswer(field)]));
  if (typeof value !== "string") return value;
  if (checkIsSurveyLogicBooleanText(value)) return value.toLowerCase() === "true";
  if (
    value.length > 1 &&
    STRING_QUOTES.some((quote) => value.startsWith(quote)) &&
    STRING_QUOTES.some((quote) => value.endsWith(quote))
  )
    return value.slice(1, -1);

  return value;
};
