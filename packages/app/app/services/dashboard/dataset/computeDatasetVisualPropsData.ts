import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationComputeMap } from "@/services/dashboard/dataset/DatasetAggregationComputeMap";
import { takeOne } from "@esposter/shared";

const SingleSeriesVisualTypes: ReadonlySet<VisualType> = new Set([
  VisualType.Pie,
  VisualType.PolarArea,
  VisualType.RadialBar,
]);

export const computeDatasetVisualPropsData = (
  visualType: VisualType,
  dataset: Dataset,
  query: DatasetQuery,
): VisualPropsData => {
  const categoryRows = new Map<string, Dataset["rows"]>();
  for (const row of dataset.rows) {
    const category = String(row[query.xColumn] ?? "");
    const rows = categoryRows.get(category);
    if (rows) rows.push(row);
    else categoryRows.set(category, [row]);
  }
  const categories = [...categoryRows.keys()];
  const series = query.series.map(({ aggregation, column }) => ({
    data: [...categoryRows.values()].map((rows) =>
      DatasetAggregationComputeMap[aggregation](rows.map((row) => row[column] ?? null)),
    ),
    name: column,
  }));
  return SingleSeriesVisualTypes.has(visualType)
    ? { options: { labels: categories }, series: takeOne(series).data }
    : { options: { xaxis: { categories } }, series };
};
