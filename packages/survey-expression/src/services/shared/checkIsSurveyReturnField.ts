import { checkIsSurveyFieldName } from "#src/services/shared/checkIsSurveyFieldName";

// Whether an argument is the third one of an array function's return-field form: a text that names a field
export const checkIsSurveyReturnField = (value: unknown): value is string =>
  typeof value === "string" && checkIsSurveyFieldName(value);
