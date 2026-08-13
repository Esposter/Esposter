import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { CSV_SEMICOLON_SETTINGS, CSV_SETTINGS } from "@/services/resource/sheet/csv/constants.test";
import { createCsvFile } from "@/services/resource/sheet/csv/createCsvFile.test";
import { deserializeCsv } from "@/services/resource/sheet/csv/deserializeCsv";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeCsv, () => {
  test("parses columns and rows from CSV", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createCsvFile("a,b\n0,1\n2,3"), CSV_SETTINGS);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(columns).type).toBe(ColumnType.Number);
    expect(takeOne(columns, 1).name).toBe("b");
    expect(rows).toHaveLength(2);
    expect(takeOne(rows).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createCsvFile("a;b\n0;1"), CSV_SEMICOLON_SETTINGS);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(rows).data).toStrictEqual({ a: 0, b: 1 });
  });

  test("empty file returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const { columns, metadata, rows } = await deserializeCsv(createCsvFile(""), CSV_SETTINGS);

    expect(columns).toHaveLength(0);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Csv);
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createCsvFile("a,b"), CSV_SETTINGS);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(columns).type).toBe(ColumnType.String);
    expect(rows).toHaveLength(0);
  });

  test("empty column name falls back to Column N", async () => {
    expect.hasAssertions();

    const { columns } = await deserializeCsv(createCsvFile(",b\n0,1"), CSV_SETTINGS);

    expect(takeOne(columns).name).toBe("Column 1");
    expect(takeOne(columns, 1).name).toBe("b");
  });
});
