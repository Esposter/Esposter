import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { AxisVisualPropsData } from "@/models/dashboard/AxisVisualPropsData";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { DASHBOARD_TABLE_CATEGORY_KEY } from "@/services/dashboard/constants";
import { takeOne } from "@esposter/shared";

// The key a series' column is read from, by its position, so a category sharing a series' name cannot overwrite it
const getSeriesKey = (index: number) => `series${index}`;
// The drawn values as a dataset: one row per category with a column per series, or one row for a card.
// Each column is keyed by its position, and its title is what the file prints
export const createDrawnDataset = (
  shape: VisualDatasetShape,
  { xColumn }: DatasetQuery,
  { options, series }: AxisVisualPropsData,
): Dataset => {
  const isSingle = shape === VisualDatasetShape.Single;
  const categories = (options?.xaxis?.categories ?? []).map(String);
  const seriesColumns: Dataset["columns"] = series.map(({ name }, index) => ({
    name: getSeriesKey(index),
    title: `${name}`,
    type: ColumnType.Number,
  }));
  const columns: Dataset["columns"] = isSingle
    ? seriesColumns
    : [{ name: DASHBOARD_TABLE_CATEGORY_KEY, title: xColumn, type: ColumnType.String }, ...seriesColumns];
  const rows = Array.from({ length: isSingle ? 1 : categories.length }, (_row, index) => ({
    ...(isSingle ? {} : { [DASHBOARD_TABLE_CATEGORY_KEY]: takeOne(categories, index) }),
    ...Object.fromEntries(
      series.map((item, seriesIndex) => [getSeriesKey(seriesIndex), Number(takeOne(item.data, index))]),
    ),
  }));
  return { columns, rows };
};
