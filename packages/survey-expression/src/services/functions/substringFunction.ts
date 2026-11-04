import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyOptionalArgument } from "#src/services/shared/getSurveyOptionalArgument";
import { getSurveyTextIndex } from "#src/services/shared/getSurveyTextIndex";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The part of a text from a start index up to an end index, where an empty or absent end runs to the text's end.
// A value that is not a text reads as its text, and an unanswered text has no part.
// An index reads as a number, so a start that reads as none has no part, and so does a present end that reads as none
export const substringFunction: SurveyLogicFunction = (args) => {
  const [textValue, start, end] = args;
  const startNumber = toSurveyLogicNumber(start);
  if (textValue === undefined || startNumber === undefined) return undefined;

  const text = toSurveyLogicText(textValue);
  const endNumber = getSurveyOptionalArgument(end, text.length, toSurveyLogicNumber);
  if (endNumber === undefined) return undefined;

  const startIndex = getSurveyTextIndex(startNumber, text.length);
  const endIndex = getSurveyTextIndex(endNumber, text.length);
  return text.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex));
};
