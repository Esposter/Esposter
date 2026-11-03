import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";

// The values a function reads as one flat list: an array's items in place of the array, each number text as its number
// And an unanswered value left out, so a sum and a count read the same values whether passed alone or inside a list
export const flattenSurveyValues = (values: SurveyLogicValue[]): SurveyLogicValue[] =>
  values.flatMap((value) => {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return flattenSurveyValues(value);

    const number = getSurveyNumber(value);
    return [Number.isNaN(number) ? value : number];
  });
