import type { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";

// The one title a query series goes by: a card's default label and the order's options both name it this way
export const getDatasetSeriesTitle = (aggregation: DatasetAggregationType, column: string) =>
  `${aggregation} of ${column}`;
