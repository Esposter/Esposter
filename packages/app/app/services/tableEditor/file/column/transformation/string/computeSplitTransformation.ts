import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

export const computeSplitTransformation = (value: string, delimiter: string, segmentIndex: number): ColumnValue =>
  value.split(delimiter).at(segmentIndex) ?? null;
