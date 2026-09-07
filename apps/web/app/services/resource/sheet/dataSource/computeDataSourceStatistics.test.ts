import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { computeDataSourceStatistics } from "@/services/resource/sheet/dataSource/computeDataSourceStatistics";
import { describe, expect, test } from "vitest";

describe(computeDataSourceStatistics, () => {
  // Size is the sheet's own, not any one column's, so the columns carry different sizes — a reduce that
  // Returned the first or the largest would still pass against a uniform set
  test("reports the counts and the summed column size", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a", 1), createColumn("b", 2)], [createRow({ a: " ", b: " " })]);

    expect(computeDataSourceStatistics(dataSource)).toStrictEqual({ columnCount: 2, rowCount: 1, size: 3 });
  });

  // The figures are rendered straight into the metadata bar, so a sheet with nothing in it has to answer with
  // Zeroes rather than with the blanks an unseeded sum would leave
  test("answers with zeroes for a data source with no columns or rows", () => {
    expect.hasAssertions();

    expect(computeDataSourceStatistics(createDataSource())).toStrictEqual({ columnCount: 0, rowCount: 0, size: 0 });
  });
});
