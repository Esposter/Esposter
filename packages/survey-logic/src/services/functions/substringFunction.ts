import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";
import { getSurveyTextIndex } from "#src/services/shared/getSurveyTextIndex";

// The part of a text from a start index up to an end index, which runs to the text's end when no number is given for it. A
// Text that is not one, or a start that is not a number, reads as empty
export const substringFunction: SurveyLogicFunction = (args) => {
  const [text, start, end] = args;
  if (typeof text !== "string" || Number.isNaN(getSurveyNumber(start))) return "";

  const startIndex = getSurveyTextIndex(Number(start), text.length);
  const endIndex = Number.isNaN(getSurveyNumber(end)) ? text.length : getSurveyTextIndex(Number(end), text.length);
  return text.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex));
};
