import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetOrderDirection } from "#shared/models/dataset/DatasetOrderDirection";
import { removeDatasetQuerySeries } from "#src/services/dashboard/dataset/removeDatasetQuerySeries";
import { describe, expect, test } from "vitest";

describe(removeDatasetQuerySeries, () => {
  const count = { aggregation: DatasetAggregationType.Count, column: "x" };
  const sum = { aggregation: DatasetAggregationType.Sum, column: "y" };
  const query: DatasetQuery = {
    order: { direction: DatasetOrderDirection.Ascending, seriesIndex: 1 },
    series: [count, sum],
    xColumn: "x",
  };

  // Removing a series shifts the ones after it a place, so an order keeps naming the series it ranks by
  test("removing a series before the one an order ranks by moves the order along with it", () => {
    expect.hasAssertions();

    expect(removeDatasetQuerySeries(query, 0)).toStrictEqual({
      order: { direction: DatasetOrderDirection.Ascending, seriesIndex: 0 },
      series: [sum],
      xColumn: "x",
    });
  });

  // An order ranking by the series removed has nothing left to rank by, so the categories fall back to their first-seen order
  test("removing the series an order ranks by drops the order", () => {
    expect.hasAssertions();

    const removedQuery = removeDatasetQuerySeries(query, 1);

    expect({ order: removedQuery.order, series: removedQuery.series }).toStrictEqual({
      order: undefined,
      series: [count],
    });
  });
});
