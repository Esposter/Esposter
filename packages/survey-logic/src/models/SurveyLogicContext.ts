import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// What an expression reads: the answers and calculated values by name, and the scopes its caller passes.
// The survey engine passes one scope, `panel`, for a dynamic panel's row. The caller passes the clock too, so a test fixes it.
// Built from answers read through toSurveyLogicAnswer, so it holds no null: every caller that holds stored answers converts them.
export interface SurveyLogicContext {
  now: Date;
  scopes: Record<string, Record<string, SurveyLogicValue>>;
  values: Record<string, SurveyLogicValue>;
}
