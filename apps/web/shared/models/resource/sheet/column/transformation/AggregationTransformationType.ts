import { z } from "zod";

export const AggregationTransformationType = {
  Average: "Average",
  Count: "Count",
  Maximum: "Maximum",
  Minimum: "Minimum",
  PercentOfTotal: "PercentOfTotal",
  Rank: "Rank",
  RunningSummation: "RunningSummation",
} as const;
export type AggregationTransformationType =
  (typeof AggregationTransformationType)[keyof typeof AggregationTransformationType];

export const aggregationTransformationTypeSchema = z.enum(
  AggregationTransformationType,
) satisfies z.ZodType<AggregationTransformationType>;
