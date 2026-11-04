import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// What an expression reads: the answers and calculated values by name, and the scopes its caller passes.
// The survey engine passes one scope, `panel`, for a dynamic panel's row. The caller passes the clock too, so a test fixes it.
// The values and scopes are already read as answers by toSurveyLogicAnswer, so no null is here
export interface SurveyLogicContext {
  now: Date;
  scopes: Record<string, Record<string, SurveyLogicValue>>;
  values: Record<string, SurveyLogicValue>;
}
