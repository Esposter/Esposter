import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Column } from "#shared/models/tableEditor/file/column/Column";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { serializeJson } from "@/services/tableEditor/file/json/serializeJson";
import { describe, expect, test } from "vitest";

describe(serializeJson, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Json].mimeType;

  const createDataSource = (columns: DataSource["columns"], rows: Row[]): DataSource => ({
    columns,
    metadata: { dataSourceType: DataSourceType.Json, importedAt: new Date(0), name: "", size: 0 },
    rows,
    stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
  });

  const createColumn = (name: string) => new Column({ name, size: 0, sourceName: name });

  const createRow = (data: Record<string, number>): Row => new Row({ data });

  test("serializes rows to JSON array with column names as keys", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const blob = await serializeJson(dataSource, new JsonDataSourceItem(), MIME_TYPE);
    const text = await blob.text();

    expect(JSON.parse(text)).toStrictEqual([
      { a: 0, b: 1 },
      { a: 2, b: 3 },
    ]);
  });

  test("returns blob with correct mime type", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([], []);
    const blob = await serializeJson(dataSource, new JsonDataSourceItem(), MIME_TYPE);

    expect(blob.type).toBe(MIME_TYPE);
  });

  test("empty rows produces empty array", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], []);
    const blob = await serializeJson(dataSource, new JsonDataSourceItem(), MIME_TYPE);
    const text = await blob.text();

    expect(JSON.parse(text)).toStrictEqual([]);
  });
});
