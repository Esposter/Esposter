import { z } from "zod";

export enum AggregationTransformationType {
  PercentOfTotal = "PercentOfTotal",
  Rank = "Rank",
  RunningSum = "RunningSum",
}

export const aggregationTransformationTypeSchema = z.enum(AggregationTransformationType);
