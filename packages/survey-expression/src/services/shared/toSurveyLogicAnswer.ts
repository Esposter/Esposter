import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { mapSurveyLogicValues } from "#src/services/shared/mapSurveyLogicValues";

// The value an answer reads as, at every depth: its stored type.
// A null reads as unanswered, so no expression reads one.
// A text is never read again as source text, so a text spelling a boolean or wrapped in quotes stays text.
// An operation reads it as a number only where it asks for one.
export const toSurveyLogicAnswer = (value: SurveyLogicStoredValue): SurveyLogicValue => {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map((item) => toSurveyLogicAnswer(item));
  if (typeof value === "object") return mapSurveyLogicValues(value, toSurveyLogicAnswer);

  return value;
};
