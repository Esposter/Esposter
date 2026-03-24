import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Column } from "#shared/models/tableEditor/file/column/Column";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { serializeCsv } from "@/services/tableEditor/file/csv/serializeCsv";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { describe, expect, test } from "vitest";

describe(serializeCsv, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Csv].mimeType;

  const createDataSource = (columns: DataSource["columns"], rows: Row[]): DataSource => ({
    columns,
    metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
    rows,
    stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
  });

  const createColumn = (name: string) => new Column({ name, size: 0, sourceName: name });

  const createRow = (data: Record<string, number>): Row => new Row({ data });

  test("serializes columns and rows to CSV with comma delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const item = new CsvDataSourceItem();
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);
    const text = await blob.text();

    expect(text).toBe("a,b\n0,1\n2,3");
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: 0, b: 1 })]);
    const item = new CsvDataSourceItem({ configuration: { delimiter: CsvDelimiter.Semicolon } });
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);
    const text = await blob.text();

    expect(text).toBe("a;b\n0;1");
  });

  test("escapes cells containing the delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [new Row({ data: { a: "0,1" } })]);
    const item = new CsvDataSourceItem();
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);
    const text = await blob.text();

    expect(text).toBe('a\n"0,1"');
  });

  test("escapes cells containing double quotes", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [new Row({ data: { a: 'say "hi"' } })]);
    const item = new CsvDataSourceItem();
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);
    const text = await blob.text();

    expect(text).toBe('a\n"say ""hi"""');
  });

  test("escapes cells containing newlines", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [new Row({ data: { a: "0\n1" } })]);
    const item = new CsvDataSourceItem();
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);
    const text = await blob.text();

    expect(text).toBe('a\n"0\n1"');
  });

  test("returns blob with correct mime type", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([], []);
    const item = new CsvDataSourceItem();
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);

    expect(blob.type).toBe(MIME_TYPE);
  });

  test("empty rows produces only header row", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], []);
    const item = new CsvDataSourceItem();
    const blob = await serializeCsv(dataSource, item, MIME_TYPE);
    const text = await blob.text();

    expect(text).toBe("a");
  });
});
