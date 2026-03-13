import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Column } from "#shared/models/tableEditor/file/Column";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/Row";
import { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";
import { beforeEach, describe, expect, test, vi } from "vitest";
import writeXlsxFile from 'write-excel-file/browser';
import type { SheetData } from 'write-excel-file/browser';

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("passes header and data rows to writeXlsxFile", async () => {
    expect.hasAssertions();

    const mockBlob = new Blob([""], { type: MIME_TYPE });
    vi.mocked(writeXlsxFile).mockResolvedValue(mockBlob);
    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );

    await serializeXlsx(dataSource, new XlsxDataSourceItem(), MIME_TYPE);

    expect(vi.mocked(writeXlsxFile)).toHaveBeenCalledWith(
      [
        ["a", "b"],
        [0, 1],
        [2, 3],
      ],
      {},
    );
  });

  test("returns blob from writeXlsxFile", async () => {
    expect.hasAssertions();

    const mockBlob = new Blob([""], { type: MIME_TYPE });
    vi.mocked(writeXlsxFile).mockResolvedValue(mockBlob);
    const dataSource = createDataSource([], []);

    const blob = await serializeXlsx(dataSource, new XlsxDataSourceItem(), MIME_TYPE);

    expect(blob).toBe(mockBlob);
  });

  test("empty rows passes only header row to writeXlsxFile", async () => {
    expect.hasAssertions();

    vi.mocked(writeXlsxFile).mockResolvedValue(new Blob([""], { type: MIME_TYPE }));
    const dataSource = createDataSource([createColumn("a")], []);

    await serializeXlsx(dataSource, new XlsxDataSourceItem(), MIME_TYPE);

    expect(vi.mocked(writeXlsxFile)).toHaveBeenCalledWith([["a"]], {});
  });
});
