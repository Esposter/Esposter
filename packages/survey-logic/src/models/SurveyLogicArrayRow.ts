import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";

// An item of an array value whose field reads as a number, with the item itself for a field the function returns
export interface SurveyLogicArrayRow {
  field: number;
  item: SurveyLogicRecord;
}
