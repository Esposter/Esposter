import type { SurveyLogicArrayRow } from "#src/models/SurveyLogicArrayRow";

// An array function's arguments as SurveyJS reads them. A filter is a condition over each item's fields, which the
// Arguments cannot carry, so a call that passes one is flagged rather than answered without it
export interface SurveyLogicArrayParams {
  isFiltered: boolean;
  returnField?: string;
  rows: SurveyLogicArrayRow[];
}
