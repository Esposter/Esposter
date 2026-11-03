import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyTextIndex } from "#src/services/shared/getSurveyTextIndex";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// The part of a text from a start index up to an end index, which runs to the text's end when no number is given for it. A
// Text that is not one, or a start that is not a number, reads as empty. An index reads as an operand does, so a list
// Holding one number is that number
export const substringFunction: SurveyLogicFunction = (args) => {
  const [text, start, end] = args;
  const startNumber = toSurveyLogicNumber(start);
  if (typeof text !== "string" || Number.isNaN(startNumber)) return "";

  const endNumber = toSurveyLogicNumber(end);
  const startIndex = getSurveyTextIndex(startNumber, text.length);
  const endIndex = Number.isNaN(endNumber) ? text.length : getSurveyTextIndex(endNumber, text.length);
  return text.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex));
};
