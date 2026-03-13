import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { deserializeCsv } from "@/services/tableEditor/file/csv/deserializeCsv";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeCsv, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Csv].mimeType;

  const createFile = (content: string, name = "test.csv") => new File([content], name, { type: MIME_TYPE });

  test("parses columns and rows from CSV", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createFile("a,b\n0,1\n2,3"), new CsvDataSourceItem());

    expect(columns).toHaveLength(2);
    expect(takeOne(columns, 0).name).toBe("a");
    expect(takeOne(columns, 0).type).toBe(ColumnType.Number);
    expect(takeOne(columns, 1).name).toBe("b");
    expect(rows).toHaveLength(2);
    expect(takeOne(rows, 0).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const item = new CsvDataSourceItem({ configuration: { delimiter: CsvDelimiter.Semicolon } });
    const { columns, rows } = await deserializeCsv(createFile("a;b\n0;1"), item);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns, 0).name).toBe("a");
    expect(takeOne(rows, 0).data).toStrictEqual({ a: 0, b: 1 });
  });

  test("empty file returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const { columns, metadata, rows } = await deserializeCsv(createFile(""), new CsvDataSourceItem());

    expect(columns).toHaveLength(0);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Csv);
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const { columns, rows } = await deserializeCsv(createFile("a,b"), new CsvDataSourceItem());

    expect(columns).toHaveLength(2);
    expect(takeOne(columns, 0).name).toBe("a");
    expect(takeOne(columns, 0).type).toBe(ColumnType.String);
    expect(rows).toHaveLength(0);
  });

  test("empty column name falls back to Column N", async () => {
    expect.hasAssertions();

    const { columns } = await deserializeCsv(createFile(",b\n0,1"), new CsvDataSourceItem());

    expect(takeOne(columns, 0).name).toBe("Column 1");
    expect(takeOne(columns, 1).name).toBe("b");
  });
});
