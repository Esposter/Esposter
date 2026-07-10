import type { XlsxFileSettings } from "#shared/models/resource/file/XlsxFileSettings";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { Row } from "#shared/models/resource/file/datasource/Row";
import { DataSourceConfigurationMap } from "@/services/resource/file/dataSource/DataSourceConfigurationMap";
import { serializeXlsx } from "@/services/resource/file/xlsx/serializeXlsx";
import { describe, expect, test } from "vitest";

const defaultSettings: XlsxFileSettings = { configuration: { sheetIndex: 0 }, type: DataSourceType.Xlsx };

const createDataSource = (columns: StringColumn[], rows: Row[]): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Xlsx, importedAt: new Date(0), name: "", size: 0 },
  rows,
  statistics: { columnCount: columns.length, rowCount: rows.length, size: 0 },
});

const createColumn = (name: string) => new StringColumn({ name, size: 0, sourceName: name });

const createRow = (data: Record<string, number>): Row => new Row({ data });

describe(serializeXlsx, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Xlsx].mimeType;

  test("returns a blob for data with columns and rows", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const blob = await serializeXlsx(dataSource, defaultSettings, MIME_TYPE);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  test("returns a blob for empty data source", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([], []);
    const blob = await serializeXlsx(dataSource, defaultSettings, MIME_TYPE);

    expect(blob).toBeInstanceOf(Blob);
  });
});
