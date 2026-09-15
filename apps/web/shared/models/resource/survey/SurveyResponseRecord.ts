import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// One response row carrying its own key, so identity can never drift from data — matching two independently
// Read lists by index breaks the moment a response is submitted or deleted between the reads
export type SurveyResponseRecord = Record<string, ColumnValue> & { rowKey: string };
