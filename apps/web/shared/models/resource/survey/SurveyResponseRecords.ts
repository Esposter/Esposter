import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";

export interface SurveyResponseRecords {
  columns: DatasetColumn[];
  // Set when totalRows is a floor, shaped like Dataset's so the blade shares the one truncation check
  isCountCapped: boolean;
  rows: SurveyResponseRecord[];
  // The response count. Responses are the owner's record of truth, so a capped read has to say what it left behind
  // Rather than quietly end
  totalRows: number;
}
