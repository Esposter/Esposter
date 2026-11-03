import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// An item of an array value that holds the field a function reads, with the item itself for a field the function returns
export interface SurveyLogicArrayRow {
  field: SurveyLogicValue;
  item: SurveyLogicRecord;
}
