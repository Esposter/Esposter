import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { computeDatasetVisualPropsData } from "@/services/dashboard/dataset/computeDatasetVisualPropsData";
import { describe, expect, test } from "vitest";

describe(computeDatasetVisualPropsData, () => {
  const category = "a";
  const dataset: Dataset = { columns: [], rows: [{ x: category }] };
  const otherCategory = "b";
  const query: DatasetQuery = { series: [{ aggregation: DatasetAggregationType.Count, column: "x" }], xColumn: "x" };

  // A treemap draws `{ x, y }` points and has no category axis, so categories on an axis would draw nothing
  test("draws a treemap's categories as points", () => {
    expect.hasAssertions();

    expect(computeDatasetVisualPropsData(VisualType.Treemap, dataset, query)).toStrictEqual({
      series: [{ data: [{ x: category, y: 1 }], name: "x" }],
    });
  });

  // A candlestick draws four values per point, which one aggregated value per category cannot give it
  test("draws nothing for a type that needs several values per point", () => {
    expect.hasAssertions();

    expect(computeDatasetVisualPropsData(VisualType.Candlestick, dataset, query)).toBeUndefined();
  });

  // A card has no category axis, so the two rows count as one value whatever their x column holds
  test("a card counts every response in its dataset", () => {
    expect.hasAssertions();

    const cardDataset: Dataset = { columns: [], rows: [{ x: category }, { x: otherCategory }] };

    expect(computeDatasetVisualPropsData(VisualType.Card, cardDataset, query)).toStrictEqual({
      series: [{ data: [2], name: "Count of x" }],
    });
  });

  // A table lists the grouped result the chart over the same binding draws, so its numbers are the bars' exact values
  test("a table beside a bar chart shows the bars' exact values", () => {
    expect.hasAssertions();

    const tableDataset: Dataset = { columns: [], rows: [{ x: category }, { x: category }, { x: otherCategory }] };

    expect(computeDatasetVisualPropsData(VisualType.Table, tableDataset, query)).toStrictEqual(
      computeDatasetVisualPropsData(VisualType.Bar, tableDataset, query),
    );
  });
});
