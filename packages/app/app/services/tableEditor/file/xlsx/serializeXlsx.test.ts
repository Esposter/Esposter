import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Column } from "#shared/models/tableEditor/file/Column";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/Row";
import { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";
import { describe, expect, test } from "vitest";

describe(serializeXlsx, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Xlsx].mimeType;

  const createDataSource = (columns: Column[], rows: Row[]): DataSource => ({
    columns,
    metadata: { dataSourceType: DataSourceType.Xlsx, importedAt: new Date(0), name: "", size: 0 },
    rows,
    stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
  });

  const createColumn = (name: string): Column => new Column({ name, size: 0, sourceName: name });

  const createRow = (data: Record<string, number>): Row => new Row({ data });

  test("returns a blob for data with columns and rows", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const blob = await serializeXlsx(dataSource, new XlsxDataSourceItem(), MIME_TYPE);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  test("returns a blob for empty data source", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([], []);
    const blob = await serializeXlsx(dataSource, new XlsxDataSourceItem(), MIME_TYPE);

    expect(blob).toBeInstanceOf(Blob);
  });
});
