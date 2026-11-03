import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The arguments a number function reads in order: an array's items in place of the array, and an empty argument skipped
export const flattenSurveyLogicArguments = (args: SurveyLogicValue[]): SurveyLogicValue[] =>
  args.flatMap((arg) => {
    if (Array.isArray(arg)) return flattenSurveyLogicArguments(arg);
    if (arg === undefined || arg === null) return [];

    return [arg];
  });
