import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyTextIndex } from "#src/services/shared/getSurveyTextIndex";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The part of a text from a start index up to an end index, which runs to the text's end when no end is given.
// A value that is not a text reads as its text, and an unanswered text has no part.
// An index reads as a number, so a start or an end that reads as none has no part
export const substringFunction: SurveyLogicFunction = (args) => {
  const [textValue, start, end] = args;
  const startNumber = toSurveyLogicNumber(start);
  if (textValue === undefined || startNumber === undefined) return undefined;

  const text = toSurveyLogicText(textValue);
  const startIndex = getSurveyTextIndex(startNumber, text.length);
  if (end === undefined) return text.slice(startIndex);

  const endNumber = toSurveyLogicNumber(end);
  if (endNumber === undefined) return undefined;

  const endIndex = getSurveyTextIndex(endNumber, text.length);
  return text.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex));
};
