import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// One response row carrying its own key, so identity can never drift from data.
export type SurveyResponseRecord = Record<string, ColumnValue> & { rowKey: string };
