import type { SurveyLogicArrayRow } from "#src/models/SurveyLogicArrayRow";

// An array function's arguments. A filter is a condition over each item's fields, which these arguments cannot carry, so a
// Call that passes one is flagged rather than answered without it
export interface SurveyLogicArrayParams {
  isFiltered: boolean;
  returnField?: string;
  rows: SurveyLogicArrayRow[];
}
