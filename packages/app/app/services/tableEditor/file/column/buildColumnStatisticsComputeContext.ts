import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnStatisticsComputeContext } from "@/models/tableEditor/file/column/ColumnStatisticsComputeContext";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

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
