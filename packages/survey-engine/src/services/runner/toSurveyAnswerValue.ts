import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyLogicValue } from "survey-logic";

// A computed value as a stored answer. An empty result has no answer to store
// A list or a record holding one is left out with it, since an answer cannot hold a gap
export const toSurveyAnswerValue = (value: SurveyLogicValue): SurveyAnswerValue | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    const items: SurveyAnswerValue[] = [];
    for (const item of value) {
      const answerItem = toSurveyAnswerValue(item);
      if (answerItem === undefined) return undefined;

      items.push(answerItem);
    }
    return items;
  }

  const record: Record<string, SurveyAnswerValue> = {};
  for (const [name, field] of Object.entries(value)) {
    const answerField = toSurveyAnswerValue(field);
    if (answerField === undefined) return undefined;

    record[name] = answerField;
  }
  return record;
};
