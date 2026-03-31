import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ColumnStatComputeContext } from "@/models/tableEditor/file/column/ColumnStatComputeContext";

export const buildColumnStatComputeContext = (
  column: Column,
  values: (ColumnValue | undefined)[],
): ColumnStatComputeContext => ({
  column,
  nonNullBooleans: values.filter((value): value is boolean => typeof value === "boolean"),
  nonNullNumbers: values.filter((value): value is number => typeof value === "number"),
  nonNullStrings: values.filter((value): value is string => typeof value === "string"),
  nullCount: values.filter((value) => value === null).length,
  values,
});
