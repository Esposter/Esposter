import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// An answer that holds named fields, as a dynamic panel's or a matrix's item does, read by its field's name
export interface SurveyLogicRecord extends Record<string, SurveyLogicValue> {}
