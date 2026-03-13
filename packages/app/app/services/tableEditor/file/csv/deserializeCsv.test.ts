import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { deserializeCsv } from "@/services/tableEditor/file/csv/deserializeCsv";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeCsv, () => {
  const createFile = (content: string, name = "test.csv") => new File([content], name, { type: "text/csv" });

  test("parses columns and rows from CSV", async () => {
    expect.hasAssertions();

    const dataSource = await deserializeCsv(createFile("a,b\n0,1\n2,3"), new CsvDataSourceItem());

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("a");
    expect(takeOne(dataSource.columns, 0).type).toBe(ColumnType.Number);
    expect(takeOne(dataSource.columns, 1).name).toBe("b");
    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(dataSource.rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const item = new CsvDataSourceItem({ configuration: { delimiter: CsvDelimiter.Semicolon } });
    const dataSource = await deserializeCsv(createFile("a;b\n0;1"), item);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("a");
    expect(takeOne(dataSource.rows, 0).data).toStrictEqual({ a: 0, b: 1 });
  });

  test("empty file returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const dataSource = await deserializeCsv(createFile(""), new CsvDataSourceItem());

    expect(dataSource.columns).toHaveLength(0);
    expect(dataSource.rows).toHaveLength(0);
    expect(dataSource.metadata.dataSourceType).toBe(DataSourceType.Csv);
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const dataSource = await deserializeCsv(createFile("a,b"), new CsvDataSourceItem());

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("a");
    expect(takeOne(dataSource.columns, 0).type).toBe(ColumnType.String);
    expect(dataSource.rows).toHaveLength(0);
  });

  test("empty column name falls back to Column N", async () => {
    expect.hasAssertions();

    const dataSource = await deserializeCsv(createFile(",b\n0,1"), new CsvDataSourceItem());

    expect(takeOne(dataSource.columns, 0).name).toBe("Column 1");
    expect(takeOne(dataSource.columns, 1).name).toBe("b");
  });
});
