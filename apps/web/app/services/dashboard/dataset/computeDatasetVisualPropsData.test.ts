import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { computeDatasetVisualPropsData } from "@/services/dashboard/dataset/computeDatasetVisualPropsData";
import { describe, expect, test } from "vitest";

describe(computeDatasetVisualPropsData, () => {
  const category = "a";
  const dataset: Dataset = { columns: [], rows: [{ x: category }] };
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
});
