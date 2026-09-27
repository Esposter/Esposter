export interface AggregationTransformationComputeContext {
  nonNullValues: number[];
  // Row-aligned with the filtered dataset, so a reader indexes it by rowIndex instead of walking the rows again
  numbers: (null | number)[];
}
