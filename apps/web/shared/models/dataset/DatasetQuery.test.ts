import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetOrderDirection } from "#shared/models/dataset/DatasetOrderDirection";
import { datasetQuerySchema } from "#shared/models/dataset/DatasetQuery";
import { describe, expect, test } from "vitest";

// The messages the query schema reports for a query, read off a parse of its stored form
const readIssueMessages = (query: object) => {
  const result = datasetQuerySchema.safeParse(query);
  return result.success ? [] : result.error.issues.map(({ message }) => message);
};

describe("datasetQuerySchema", () => {
  const query = { series: [{ aggregation: DatasetAggregationType.Count, column: "x" }], xColumn: "x" };

  test("an order naming a missing series is refused", () => {
    expect.hasAssertions();

    expect(
      readIssueMessages({ ...query, order: { direction: DatasetOrderDirection.Ascending, seriesIndex: 1 } }),
    ).toStrictEqual(["An order names a series the query does not have"]);
  });
});
