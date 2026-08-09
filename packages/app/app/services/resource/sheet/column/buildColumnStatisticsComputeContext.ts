import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnStatisticsComputeContext } from "@/models/resource/sheet/column/ColumnStatisticsComputeContext";

import { countOccurrences } from "#shared/util/array/countOccurrences";

export const buildColumnStatisticsComputeContext = (
  columnType: ColumnType,
  values: (ColumnValue | undefined)[],
): ColumnStatisticsComputeContext => {
  const nonNullStrings = values.filter((value): value is string => typeof value === "string");
  return {
    columnType,
    nonNullBooleans: values.filter((value): value is boolean => typeof value === "boolean"),
    nonNullNumbers: values.filter((value): value is number => typeof value === "number"),
    nonNullStrings,
    nullCount: values.filter((value) => value === null).length,
    stringCountMap: countOccurrences(nonNullStrings),
    values,
  };
};
