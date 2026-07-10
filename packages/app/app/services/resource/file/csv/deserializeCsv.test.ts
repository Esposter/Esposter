import type { CsvFileSettings } from "#shared/models/resource/file/CsvFileSettings";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { CsvDelimiter } from "#shared/models/resource/file/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { deserializeCsv } from "@/services/resource/file/csv/deserializeCsv";
import { DataSourceConfigurationMap } from "@/services/resource/file/dataSource/DataSourceConfigurationMap";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const defaultSettings: CsvFileSettings = { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv };

describe(deserializeCsv, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Csv].mimeType;

  const createFile = (content: string, name = "test.csv") => new File([content], name, { type: MIME_TYPE });

  test("parses columns and rows from CSV", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createFile("a,b\n0,1\n2,3"), defaultSettings);

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

    const item = {
      configuration: { delimiter: CsvDelimiter.Semicolon },
      type: DataSourceType.Csv,
    } satisfies CsvFileSettings;
    const { columns, rows } = await deserializeCsv(createFile("a;b\n0;1"), item);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(rows).data).toStrictEqual({ a: 0, b: 1 });
  });

  test("empty file returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const { columns, metadata, rows } = await deserializeCsv(createFile(""), defaultSettings);

    expect(columns).toHaveLength(0);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Csv);
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createFile("a,b"), defaultSettings);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(columns).type).toBe(ColumnType.String);
    expect(rows).toHaveLength(0);
  });

  test("empty column name falls back to Column N", async () => {
    expect.hasAssertions();

    const { columns } = await deserializeCsv(createFile(",b\n0,1"), defaultSettings);

    expect(takeOne(columns).name).toBe("Column 1");
    expect(takeOne(columns, 1).name).toBe("b");
  });
});
