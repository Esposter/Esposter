import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";
import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";

import { toSurveyLogicAnswer } from "#src/services/shared/toSurveyLogicAnswer";

// The answers of a record, each read as an answer
export const toSurveyLogicAnswers = (record: Record<string, SurveyLogicStoredValue>): SurveyLogicRecord =>
  Object.fromEntries(Object.entries(record).map(([name, answer]) => [name, toSurveyLogicAnswer(answer)]));
