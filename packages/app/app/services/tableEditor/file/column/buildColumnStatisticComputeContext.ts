import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ColumnStatisticComputeContext } from "@/models/tableEditor/file/column/ColumnStatisticComputeContext";

export const buildColumnStatisticComputeContext = (
  column: Column,
  values: (ColumnValue | undefined)[],
): ColumnStatisticComputeContext => ({
  column,
  nonNullBooleans: values.filter((value): value is boolean => typeof value === "boolean"),
  nonNullNumbers: values.filter((value): value is number => typeof value === "number"),
  nonNullStrings: values.filter((value): value is string => typeof value === "string"),
  nullCount: values.filter((value) => value === null).length,
  values,
});
