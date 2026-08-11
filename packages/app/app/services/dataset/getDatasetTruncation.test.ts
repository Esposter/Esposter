import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { describe, expect, test } from "vitest";

describe(getDatasetTruncation, () => {
  const columnName = "columnName";
  const columns: DatasetColumn[] = [{ name: columnName, type: ColumnType.String }];
  const createDataset = (rowCount: number, totalRows?: number, partialColumns?: string[]): Dataset => ({
    columns,
    partialColumns,
    rows: Array.from({ length: rowCount }, () => ({ [columnName]: "value" })),
    totalRows,
  });

  test("reports nothing when the provider omits the total", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(1))).toBeUndefined();
  });

  test("reports nothing when every row was read", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(1, 1))).toBeUndefined();
  });

  test("reports nothing when the total trails the rows", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(2, 1))).toBeUndefined();
  });

  test("reports the hidden rows when the read was capped", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(1, 3))).toStrictEqual({
      hiddenRows: 2,
      isCountCapped: false,
      partialColumns: [],
      shownRows: 1,
      totalRows: 3,
    });
  });

  test("reports every row as hidden for an empty capped read", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(0, 2))).toStrictEqual({
      hiddenRows: 2,
      isCountCapped: false,
      partialColumns: [],
      shownRows: 0,
      totalRows: 2,
    });
  });

  // A partial column is the shortfall rows cannot show: every row is present, so a row count agrees with the
  // Provider and the warning is the only thing that says the column under-reports
  test("reports a partial column when no rows are hidden at all", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(2, 2, ["responded"]))).toStrictEqual({
      hiddenRows: 0,
      isCountCapped: false,
      partialColumns: ["responded"],
      shownRows: 2,
      totalRows: 2,
    });
  });

  test("marks the count as capped at the counting bound", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(1, DATASET_MAX_COUNTED_ROWS))).toStrictEqual({
      hiddenRows: DATASET_MAX_COUNTED_ROWS - 1,
      isCountCapped: true,
      partialColumns: [],
      shownRows: 1,
      totalRows: DATASET_MAX_COUNTED_ROWS,
    });
  });
});
