import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";

// A published snapshot is a public read, so it keeps the columns the query draws from and no other: every row stays,
// Since the aggregation needs them all, but a column the chart never reads is the source's and not the chart's
export const projectDatasetToQuery = (dataset: Dataset, { series, xColumn }: DatasetQuery): Dataset => {
  const readColumnNames = new Set([xColumn, ...series.map(({ column }) => column)]);
  return {
    ...dataset,
    columns: dataset.columns.filter(({ name }) => readColumnNames.has(name)),
    ...(dataset.partialColumns
      ? { partialColumns: dataset.partialColumns.filter((name) => readColumnNames.has(name)) }
      : {}),
    rows: dataset.rows.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([name]) => readColumnNames.has(name))),
    ),
  };
};
