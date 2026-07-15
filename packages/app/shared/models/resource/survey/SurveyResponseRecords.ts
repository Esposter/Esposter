import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// Each row carries its own key, so identity can never drift from data — matching two independently
// Read lists by index breaks the moment a response is submitted or deleted between the reads
export interface SurveyResponseRecords {
  columns: DatasetColumn[];
  rows: (Record<string, ColumnValue> & { rowKey: string })[];
}
