export const ColumnStatisticName = {
  Average: "average",
  FalseCount: "falseCount",
  Maximum: "maximum",
  Minimum: "minimum",
  MostFrequentValue: "mostFrequentValue",
  NullCount: "nullCount",
  NullPercentage: "nullPercentage",
  StandardDeviation: "standardDeviation",
  Summation: "summation",
  TrueCount: "trueCount",
  UniqueCount: "uniqueCount",
} as const;
export type ColumnStatisticName = (typeof ColumnStatisticName)[keyof typeof ColumnStatisticName];
