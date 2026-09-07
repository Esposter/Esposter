export interface AggregationTransformationComputeContext {
  nonNullValues: number[];
  // Row-aligned with the filtered dataset, so a computer indexes it by rowIndex instead of walking the rows again
  numbers: (null | number)[];
  rowIndex: number;
}
