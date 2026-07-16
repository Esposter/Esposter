import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// Each row carries its own key, so identity can never drift from data — matching two independently
// Read lists by index breaks the moment a response is submitted or deleted between the reads
export interface SurveyResponseRecords {
  columns: DatasetColumn[];
  rows: (Record<string, ColumnValue> & { rowKey: string })[];
  // The uncapped count, shaped like Dataset's so the blade shares the one truncation check. Responses are
  // The owner's record of truth, so a capped read has to say what it left behind rather than quietly end
  totalRows: number;
}
