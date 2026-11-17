import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { VisualPropsData } from "#src/models/dashboard/VisualPropsData";

import { VisualDatasetShape } from "#src/models/dashboard/VisualDatasetShape";
import { DatasetAggregationComputeMap } from "#src/services/dashboard/dataset/DatasetAggregationComputeMap";
import { getCategoryComparator } from "#src/services/dashboard/dataset/getCategoryComparator";
import { VisualTypeDatasetShapeMap } from "#src/services/dashboard/dataset/VisualTypeDatasetShapeMap";
import { exhaustiveGuard, getOrCreate, takeOne } from "@esposter/shared";

// Undefined for a visual type no aggregated query can draw, which then shows its demo data as an unbound one does
export const computeDatasetVisualPropsData = (
  visualType: VisualType,
  dataset: Dataset,
  query: DatasetQuery,
): undefined | VisualPropsData => {
  const shape = VisualTypeDatasetShapeMap[visualType];
  if (shape === VisualDatasetShape.None) return undefined;
  // A card has no category axis, so its one value is the first series over every row, and the x column is ignored
  if (shape === VisualDatasetShape.Single) {
    const { aggregation, column } = takeOne(query.series);
    return {
      series: [
        {
          data: [DatasetAggregationComputeMap[aggregation](dataset.rows.map((row) => row[column] ?? null))],
          name: `${aggregation} of ${column}`,
        },
      ],
    };
  }

  const categoryRowsMap = new Map<string, Dataset["rows"]>();
  for (const row of dataset.rows) {
    const category = String(row[query.xColumn] ?? "");
    getOrCreate(categoryRowsMap, category, () => []).push(row);
  }
  const categoryEntries = Array.from(categoryRowsMap, ([category, rows]) => ({
    category,
    values: query.series.map(({ aggregation, column }) =>
      DatasetAggregationComputeMap[aggregation](rows.map((row) => row[column] ?? null)),
    ),
  }));
  // The order ranks the aggregated values, never the rows, and its sort is stable, so categories that tie keep their first-seen order
  const orderedEntries = query.order
    ? categoryEntries.toSorted(getCategoryComparator(categoryEntries, query.order))
    : categoryEntries;
  const categories = orderedEntries.map(({ category }) => category);
  const series = query.series.map(({ column }, seriesIndex) => ({
    data: orderedEntries.map(({ values }) => takeOne(values, seriesIndex)),
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
