import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { AxisVisualPropsData } from "@/models/dashboard/AxisVisualPropsData";
import type { Dataset } from "#shared/models/dataset/Dataset";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { takeOne } from "@esposter/shared";

// The drawn values as a dataset: one row per category with a column per series, or one row for a card. Each column is
// keyed by its position, so a category sharing a series' name cannot overwrite it, and its title is what the file prints
export const createDrawnDataset = (
  shape: VisualDatasetShape,
  { xColumn }: DatasetQuery,
  { options, series }: AxisVisualPropsData,
): Dataset => {
  const isSingle = shape === VisualDatasetShape.Single;
  const categories = (options?.xaxis?.categories ?? []).map(String);
  const seriesColumns = series.map(({ name }, index) => ({
    name: `series${index}`,
    title: `${name}`,
    type: ColumnType.Number,
  }));
  const columns = isSingle
    ? seriesColumns
    : [{ name: "category", title: xColumn, type: ColumnType.String }, ...seriesColumns];
  const rows = Array.from({ length: isSingle ? 1 : categories.length }, (_row, index) => ({
    ...(isSingle ? {} : { category: takeOne(categories, index) }),
    ...Object.fromEntries(
      series.map((item, seriesIndex) => [`series${seriesIndex}`, Number(takeOne(item.data, index))]),
    ),
  }));
  return { columns, rows };
};
