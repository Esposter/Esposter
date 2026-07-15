import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { describe, expect, test } from "vitest";

describe(getDatasetTruncation, () => {
  const columnName = "columnName";
  const columns: DatasetColumn[] = [{ name: columnName, type: ColumnType.String }];
  const createDataset = (rowCount: number, totalRows?: number): Dataset => ({
    columns,
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

    expect(getDatasetTruncation(createDataset(1, 3))).toStrictEqual({ hiddenRows: 2, shownRows: 1, totalRows: 3 });
  });

  test("reports every row as hidden for an empty capped read", () => {
    expect.hasAssertions();

    expect(getDatasetTruncation(createDataset(0, 2))).toStrictEqual({ hiddenRows: 2, shownRows: 0, totalRows: 2 });
  });
});
