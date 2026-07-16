import type { Row } from "#shared/models/resource/sheet/datasource/Row";

export interface AggregationTransformationComputeContext {
  getNumber: (row: Row) => null | number;
  nonNullValues: number[];
  rowIndex: number;
  rows: Row[];
}
