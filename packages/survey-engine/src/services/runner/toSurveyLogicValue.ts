import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyLogicRecord, SurveyLogicValue } from "survey-logic";

// The answer as the expression language reads it
// Every answer has that form: text, a number, a boolean, a list or a record whose fields read by their names, so no case is left out
export const toSurveyLogicValue = (value: SurveyAnswerValue): SurveyLogicValue => {
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => toSurveyLogicValue(item));

  const record: SurveyLogicRecord = {};
  for (const [name, field] of Object.entries(value)) record[name] = toSurveyLogicValue(field);
  return record;
};
