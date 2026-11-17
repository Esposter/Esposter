import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetOrderDirection } from "#shared/models/dataset/DatasetOrderDirection";
import { computeDatasetVisualPropsData } from "#src/services/dashboard/dataset/computeDatasetVisualPropsData";
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

  // A visual with no order lists its categories in the order its rows first name them
  test("a visual with no order keeps its first-seen categories", () => {
    expect.hasAssertions();

    const firstSeenDataset: Dataset = { columns: [], rows: [{ x: otherCategory }, { x: category }] };

    expect(computeDatasetVisualPropsData(VisualType.Bar, firstSeenDataset, query)).toStrictEqual({
      options: { xaxis: { categories: [otherCategory, category] } },
      series: [{ data: [1, 1], name: "x" }],
    });
  });

  // The order ranks the categories by the number the chart draws, so the largest comes first whichever row was named first
  test("categories sort by a series, largest first", () => {
    expect.hasAssertions();

    const sumDataset: Dataset = {
      columns: [],
      rows: [
        { x: otherCategory, y: 1 },
        { x: category, y: 5 },
      ],
    };
    const sumQuery: DatasetQuery = {
      order: { direction: DatasetOrderDirection.Descending, seriesIndex: 0 },
      series: [{ aggregation: DatasetAggregationType.Sum, column: "y" }],
      xColumn: "x",
    };

    expect(computeDatasetVisualPropsData(VisualType.Bar, sumDataset, sumQuery)).toStrictEqual({
      options: { xaxis: { categories: [category, otherCategory] } },
      series: [{ data: [5, 1], name: "y" }],
    });
  });

  // The sort is stable, so categories whose values tie keep the order their rows first name them in
  test("categories that tie keep their first-seen order", () => {
    expect.hasAssertions();

    const tieDataset: Dataset = {
      columns: [],
      rows: [
        { x: otherCategory, y: 1 },
        { x: category, y: 1 },
      ],
    };
    const tieQuery: DatasetQuery = {
      order: { direction: DatasetOrderDirection.Ascending, seriesIndex: 0 },
      series: [{ aggregation: DatasetAggregationType.Sum, column: "y" }],
      xColumn: "x",
    };

    expect(computeDatasetVisualPropsData(VisualType.Bar, tieDataset, tieQuery)).toStrictEqual({
      options: { xaxis: { categories: [otherCategory, category] } },
      series: [{ data: [1, 1], name: "y" }],
    });
  });

  // Ordered by the category, numbers compare as numbers, so 9 comes before 10 where the text would put 10 first
  test("categories ordered by the category compare numbers as numbers", () => {
    expect.hasAssertions();

    const numberDataset: Dataset = { columns: [], rows: [{ x: "10" }, { x: "9" }] };
    const numberQuery: DatasetQuery = {
      order: { direction: DatasetOrderDirection.Ascending },
      series: [{ aggregation: DatasetAggregationType.Count, column: "x" }],
      xColumn: "x",
    };

    expect(computeDatasetVisualPropsData(VisualType.Bar, numberDataset, numberQuery)).toStrictEqual({
      options: { xaxis: { categories: ["9", "10"] } },
      series: [{ data: [1, 1], name: "x" }],
    });
  });
});
