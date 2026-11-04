import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyLogicRecord } from "survey-logic";

import { toSurveyLogicAnswer } from "survey-logic";

// A row's answers as the panel scope a template question's condition reads, a name the row leaves out reading as absent
export const toSurveyPanelScope = (row: Record<string, SurveyAnswerValue | undefined>): SurveyLogicRecord => {
  const scope: SurveyLogicRecord = {};
  for (const [name, answer] of Object.entries(row)) if (answer !== undefined) scope[name] = toSurveyLogicAnswer(answer);
  return scope;
};
