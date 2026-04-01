import { z } from "zod";

export enum AggregationTransformationType {
  Average = "Average",
  Count = "Count",
  Maximum = "Maximum",
  Minimum = "Minimum",
  PercentOfTotal = "PercentOfTotal",
  Rank = "Rank",
  RunningSummation = "RunningSummation",
}

export const aggregationTransformationTypeSchema = z.enum(
  AggregationTransformationType,
) satisfies z.ZodType<AggregationTransformationType>;
