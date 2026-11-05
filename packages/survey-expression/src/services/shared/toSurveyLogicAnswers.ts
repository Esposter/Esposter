import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";
import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";

import { mapSurveyLogicValues } from "#src/services/shared/mapSurveyLogicValues";
import { toSurveyLogicAnswer } from "#src/services/shared/toSurveyLogicAnswer";

// The answers of a record, each read as an answer
export const toSurveyLogicAnswers = (record: Record<string, SurveyLogicStoredValue>): SurveyLogicRecord =>
  mapSurveyLogicValues(record, toSurveyLogicAnswer);
