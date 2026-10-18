import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";

import { AggregationTransformationComputeMap } from "#shared/services/resource/sheet/column/transformation/AggregationTransformationComputeMap";

export const compileAggregationTransformation: ColumnTransformationCompiler<AggregationTransformation> = (
  transformation,
  findSource,
) => {
  // A source that names no column aggregates to null on every row, not to the empty aggregate of no values
  if (!findSource(transformation.sourceColumnId)) return () => () => null;
  return ({ readSource, rows }) => {
    const readValue = readSource(transformation.sourceColumnId);
    const numbers = rows.map((row, rowIndex) => {
      const value = readValue(row, rowIndex);
      return typeof value === "number" ? value : null;
    });
    const reader = AggregationTransformationComputeMap[transformation.aggregationTransformationType]({
      nonNullValues: numbers.filter((value) => value !== null),
      numbers,
    });
    return (_row, rowIndex) => (rowIndex === undefined ? null : reader(rowIndex));
  };
};
