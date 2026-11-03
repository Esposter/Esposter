import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// What an expression reads: the answers and calculated values by name, the scopes a dynamic panel or matrix row adds (read
// As `{panel.name}` and `{row.name}`), and the clock, which the caller passes so a test fixes it
export interface SurveyLogicContext {
  now: Date;
  scopes: Record<string, Record<string, SurveyLogicValue>>;
  values: Record<string, SurveyLogicValue>;
}
