import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// The numbers the values read as, with an array's items read in its place.
// A value that reads as no number is left out, so an empty value, a text that is not a number, a boolean and a record count for nothing
export const flattenSurveyNumbers = (values: SurveyLogicValue[]): number[] =>
  values.flatMap((value) => {
    if (Array.isArray(value)) return flattenSurveyNumbers(value);

    const number = toSurveyLogicNumber(value);
    return number === undefined ? [] : [number];
  });
