import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { computeColumnChartData } from "@/services/resource/sheet/column/computeColumnChartData";
import { createColumnStatistics } from "@/services/resource/sheet/column/createColumnStatistics.test";
import { describe, expect, test } from "vitest";

describe(computeColumnChartData, () => {
  test(`number column returns bar chart with minimum, average, maximum`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(createColumnStatistics({ average: 1, maximum: 2, minimum: 0 }));

    expect(result?.type).toBe("bar");
    expect(result?.series).toStrictEqual([{ data: [0, 1, 2], name: "" }]);
  });

  test(`number column with all undefined statistics returns undefined`, () => {
    expect.hasAssertions();
    expect(computeColumnChartData(createColumnStatistics())).toBeUndefined();
  });

  test(`boolean column returns pie chart with trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(
      createColumnStatistics({ columnType: ColumnType.Boolean, falseCount: 1, nullCount: 1, trueCount: 2 }),
    );

    expect(result?.type).toBe("pie");
    expect(result?.series).toStrictEqual([2, 1, 1]);
  });

  test(`boolean column with undefined trueCount and falseCount defaults to 0`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(createColumnStatistics({ columnType: ColumnType.Boolean, nullCount: 2 }));

    expect(result?.series).toStrictEqual([0, 0, 2]);
  });

  test(`string column with no top frequencies returns undefined`, () => {
    expect.hasAssertions();
    expect(computeColumnChartData(createColumnStatistics({ columnType: ColumnType.String }))).toBeUndefined();
  });

  test(`string column returns horizontal bar chart of top frequencies`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(
      createColumnStatistics({
        columnName: " ",
        columnType: ColumnType.String,
        topFrequencies: [
          ["a", 3],
          ["b", 1],
        ],
      }),
    );

    expect(result?.type).toBe("bar");
    expect(result?.series).toStrictEqual([{ data: [1, 3], name: " " }]);
  });

  test(`date column returns bar chart of month frequencies in order`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(
      createColumnStatistics({
        columnType: ColumnType.Date,
        topFrequencies: [
          ["1970-01", 3],
          ["1970-02", 1],
        ],
      }),
    );

    expect(result?.type).toBe("bar");
    expect(result?.series).toStrictEqual([{ data: [3, 1], name: "" }]);
  });
});
