import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { DatasetAggregationComputeMap } from "@/services/dashboard/dataset/DatasetAggregationComputeMap";
import { VisualTypeDatasetShapeMap } from "@/services/dashboard/dataset/VisualTypeDatasetShapeMap";
import { exhaustiveGuard, getOrCreate, takeOne } from "@esposter/shared";

// Undefined for a visual type no aggregated query can draw, which then shows its demo data as an unbound one does
export const computeDatasetVisualPropsData = (
  visualType: VisualType,
  dataset: Dataset,
  query: DatasetQuery,
): undefined | VisualPropsData => {
  const shape = VisualTypeDatasetShapeMap[visualType];
  if (shape === VisualDatasetShape.None) return undefined;

  const categoryRowsMap = new Map<string, Dataset["rows"]>();
  for (const row of dataset.rows) {
    const category = String(row[query.xColumn] ?? "");
    getOrCreate(categoryRowsMap, category, () => []).push(row);
  }
  const categories = [...categoryRowsMap.keys()];
  const series = query.series.map(({ aggregation, column }) => ({
    data: Array.from(categoryRowsMap.values(), (rows) =>
      DatasetAggregationComputeMap[aggregation](rows.map((row) => row[column] ?? null)),
    ),
    name: column,
  }));
  switch (shape) {
    case VisualDatasetShape.Categories:
      return { options: { xaxis: { categories } }, series };
    case VisualDatasetShape.Labels:
      return { options: { labels: categories }, series: takeOne(series).data };
    case VisualDatasetShape.Points:
      return {
        series: series.map(({ data, name }) => ({
          data: data.map((y, index) => ({ x: takeOne(categories, index), y })),
          name,
        })),
      };
    default:
      return exhaustiveGuard(shape);
  }
};
