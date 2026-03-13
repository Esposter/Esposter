import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { deserializeXlsx } from "@/services/tableEditor/file/xlsx/deserializeXlsx";
import { takeOne } from "@esposter/shared";
import readXlsxFile from "read-excel-file/browser";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("read-excel-file/browser"), () => ({ default: vi.fn<typeof readXlsxFile>() }));

describe(deserializeXlsx, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Xlsx].mimeType;

  const createFile = (name = "test.xlsx") => new File([""], name, { type: MIME_TYPE });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("parses columns and rows from xlsx data", async () => {
    expect.hasAssertions();

    vi.mocked(readXlsxFile).mockResolvedValue([
      ["a", "b"],
      [0, 1],
      [2, 3],
    ]);
    const dataSource = await deserializeXlsx(createFile(), new XlsxDataSourceItem());

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("a");
    expect(takeOne(dataSource.columns, 0).type).toBe(ColumnType.Number);
    expect(takeOne(dataSource.columns, 1).name).toBe("b");
    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(dataSource.rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("empty xlsx data returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    vi.mocked(readXlsxFile).mockResolvedValue([]);
    const dataSource = await deserializeXlsx(createFile(), new XlsxDataSourceItem());

    expect(dataSource.columns).toHaveLength(0);
    expect(dataSource.rows).toHaveLength(0);
    expect(dataSource.metadata.dataSourceType).toBe(DataSourceType.Xlsx);
  });

  test("passes sheet index to readXlsxFile", async () => {
    expect.hasAssertions();

    vi.mocked(readXlsxFile).mockResolvedValue([]);
    const item = new XlsxDataSourceItem({ configuration: { sheetIndex: 2 } });

    await deserializeXlsx(createFile(), item);

    expect(vi.mocked(readXlsxFile)).toHaveBeenCalledWith(expect.any(File), { sheet: 3 });
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    vi.mocked(readXlsxFile).mockResolvedValue([["a", "b"]]);
    const dataSource = await deserializeXlsx(createFile(), new XlsxDataSourceItem());

    expect(dataSource.columns).toHaveLength(2);
    expect(dataSource.rows).toHaveLength(0);
  });

  test("null cell in header falls back to Column N", async () => {
    expect.hasAssertions();

    vi.mocked(readXlsxFile).mockResolvedValue([
      [null, "b"],
      ["0", "1"],
    ]);
    const dataSource = await deserializeXlsx(createFile(), new XlsxDataSourceItem());

    expect(takeOne(dataSource.columns, 0).name).toBe("Column 1");
    expect(takeOne(dataSource.columns, 1).name).toBe("b");
  });
});
