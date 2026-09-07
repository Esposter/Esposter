import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export const computeSplitTransformation = (value: string, delimiter: string, segmentIndex: number): ColumnValue =>
  value.split(delimiter).at(segmentIndex) ?? null;
