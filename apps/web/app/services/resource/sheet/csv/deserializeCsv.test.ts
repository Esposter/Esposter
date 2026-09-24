import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { CSV_SEMICOLON_SETTINGS, CSV_SETTINGS } from "@/services/resource/sheet/csv/constants.test";
import { createCsvFile } from "@/services/resource/sheet/csv/createCsvFile.test";
import { deserializeCsv } from "@/services/resource/sheet/csv/deserializeCsv";
import { describe, expect, test } from "vitest";

describe(deserializeCsv, () => {
  test("parses columns and rows from CSV", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createCsvFile("a,b\n0,1\n2,3"), CSV_SETTINGS);

    expect(columns.map(({ name, type }) => ({ name, type }))).toStrictEqual([
      { name: "a", type: ColumnType.Number },
      { name: "b", type: ColumnType.Number },
    ]);
    expect(rows.map(({ data }) => data)).toStrictEqual([
      { a: 0, b: 1 },
      { a: 2, b: 3 },
    ]);
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createCsvFile("a;b\n0;1"), CSV_SEMICOLON_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "b"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: 0, b: 1 }]);
  });

  test("empty file returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const { columns, metadata, rows } = await deserializeCsv(createCsvFile(""), CSV_SETTINGS);

    expect(columns).toStrictEqual([]);
    expect(rows).toStrictEqual([]);
    expect(metadata.dataSourceType).toBe(DataSourceType.Csv);
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createCsvFile("a,b"), CSV_SETTINGS);

    expect(columns.map(({ name, type }) => ({ name, type }))).toStrictEqual([
      { name: "a", type: ColumnType.String },
      { name: "b", type: ColumnType.String },
    ]);
    expect(rows).toStrictEqual([]);
  });

  test("empty column name falls back to Column N", async () => {
    expect.hasAssertions();

    const { columns } = await deserializeCsv(createCsvFile(",b\n0,1"), CSV_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["Column 1", "b"]);
  });
});
