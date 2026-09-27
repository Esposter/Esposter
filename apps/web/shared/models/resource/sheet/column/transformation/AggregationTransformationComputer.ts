import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { AggregationTransformationComputeContext } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationComputeContext";

// Whatever walks the whole column runs once here, and the reader it returns answers each row off that result — so
// A caller holding the reader pays for the column once rather than once per cell
export type AggregationTransformationComputer = (
  context: AggregationTransformationComputeContext,
) => (rowIndex: number) => ColumnValue;
