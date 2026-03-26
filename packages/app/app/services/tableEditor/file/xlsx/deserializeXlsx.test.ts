import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { deserializeXlsx } from "@/services/tableEditor/file/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeXlsx, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Xlsx].mimeType;

  const createDataSource = (columns: DataSource["columns"], rows: Row[]): DataSource => ({
    columns,
    metadata: { dataSourceType: DataSourceType.Xlsx, importedAt: new Date(0), name: "", size: 0 },
    rows,
    stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
  });

  const createColumn = (name: string) => new StringColumn({ name, size: 0, sourceName: name });

  const createRow = (data: Record<string, number>): Row => new Row({ data });

  const createXlsxFile = async (dataSource: DataSource, name = "test.xlsx") => {
    const blob = await serializeXlsx(dataSource, new XlsxDataSourceItem(), MIME_TYPE);
    return new File([blob], name, { type: MIME_TYPE });
  };

  test("parses columns and rows from xlsx", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const file = await createXlsxFile(dataSource);
    const { columns, rows } = await deserializeXlsx(file, new XlsxDataSourceItem());

    expect(columns).toHaveLength(2);
    expect(takeOne(columns, 0).name).toBe("a");
    expect(takeOne(columns, 0).type).toBe(ColumnType.Number);
    expect(takeOne(columns, 1).name).toBe("b");
    expect(rows).toHaveLength(2);
    expect(takeOne(rows, 0).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], []);
    const file = await createXlsxFile(dataSource);
    const { columns, metadata, rows } = await deserializeXlsx(file, new XlsxDataSourceItem());

    expect(columns).toHaveLength(2);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Xlsx);
  });
});
