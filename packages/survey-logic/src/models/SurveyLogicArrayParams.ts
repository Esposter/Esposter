import type { SurveyLogicArrayRow } from "#src/models/SurveyLogicArrayRow";

// An array function's arguments, read as its answer needs them: the items whose field reads as a number, and the field the
// Function returns when the arguments name one
export interface SurveyLogicArrayParams {
  returnField?: string;
  rows: SurveyLogicArrayRow[];
}
