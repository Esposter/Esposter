import type { Column } from "#shared/models/resource/file/column/Column";
import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";
import type { ColumnStatisticsComputeContext } from "@/models/resource/file/column/ColumnStatisticsComputeContext";

export const buildColumnStatisticsComputeContext = (
  column: Column,
  values: (ColumnValue | undefined)[],
): ColumnStatisticsComputeContext => ({
  column,
  nonNullBooleans: values.filter((value): value is boolean => typeof value === "boolean"),
  nonNullNumbers: values.filter((value): value is number => typeof value === "number"),
  nonNullStrings: values.filter((value): value is string => typeof value === "string"),
  nullCount: values.filter((value) => value === null).length,
  values,
});
