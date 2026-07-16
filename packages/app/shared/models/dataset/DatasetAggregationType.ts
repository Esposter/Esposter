import { z } from "zod";

export enum DatasetAggregationType {
  Average = "Average",
  Count = "Count",
  Maximum = "Maximum",
  Minimum = "Minimum",
  Sum = "Sum",
}

export const datasetAggregationTypeSchema = z.enum(DatasetAggregationType) satisfies z.ZodType<DatasetAggregationType>;

export const DatasetAggregationTypes = Object.values(DatasetAggregationType);
