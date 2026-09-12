import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { AggregationTransformationComputeContext } from "@/models/resource/sheet/column/transformation/AggregationTransformationComputeContext";

export type AggregationTransformationComputer = (context: AggregationTransformationComputeContext) => ColumnValue;
