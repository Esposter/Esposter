import { z } from "zod";

export const DatasetAggregationType = {
  Average: "Average",
  Count: "Count",
  Maximum: "Maximum",
  Minimum: "Minimum",
  Sum: "Sum",
} as const;
export type DatasetAggregationType = (typeof DatasetAggregationType)[keyof typeof DatasetAggregationType];

export const datasetAggregationTypeSchema = z.enum(DatasetAggregationType) satisfies z.ZodType<DatasetAggregationType>;

export const DatasetAggregationTypes = Object.values(DatasetAggregationType);
