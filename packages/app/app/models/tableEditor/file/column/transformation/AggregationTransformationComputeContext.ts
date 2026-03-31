import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

export interface AggregationTransformationComputeContext {
  getNumber: (row: Row) => null | number;
  nonNullValues: number[];
  rowIndex: number;
  rows: Row[];
}
