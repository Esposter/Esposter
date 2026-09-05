// @vitest-environment happy-dom
// The `read-excel-file` parser reads the workbook XML with DOMParser, which only a DOM environment supplies
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { deserializeXlsx } from "@/services/resource/sheet/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/resource/sheet/xlsx/serializeXlsx";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

// Both codecs are reached statically from PortableFormatMap, so whether they pull their library into the
// Importing module's graph is the fact under test — the seam records the first import instead of replacing it
const { xlsxLibraries } = vi.hoisted(() => ({ xlsxLibraries: { isReaderLoaded: false, isWriterLoaded: false } }));

vi.mock(import("read-excel-file/browser"), (importOriginal) => {
  xlsxLibraries.isReaderLoaded = true;
  return importOriginal();
});

vi.mock(import("write-excel-file/browser"), (importOriginal) => {
  xlsxLibraries.isWriterLoaded = true;
  return importOriginal();
});

describe(deserializeXlsx, () => {
  // Read while this file is still evaluating, so the assertion holds whatever order the tests run in
  const librariesLoadedAtImport = { ...xlsxLibraries };
  const defaultSettings: XlsxFileSettings = { configuration: { sheetIndex: 0 }, type: DataSourceType.Xlsx };

  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Xlsx].mimeType;

  const createXlsxFile = async (dataSource: DataSource, name = "a.xlsx") => {
    const blob = await serializeXlsx(dataSource, defaultSettings, MIME_TYPE);
    return new File([blob], name, { type: MIME_TYPE });
  };

  // Importing DataSourceConfigurationMap above is what every resource page does through the command bar, and
  // Only a Sheet can ever reach an xlsx file — the libraries have to arrive with the workbook, not the page.
  // That they still arrive is what the round trips below prove: neither can produce a workbook without them
  test("leaves the xlsx libraries out of the importing module's graph", () => {
    expect.hasAssertions();

    expect(librariesLoadedAtImport).toStrictEqual({ isReaderLoaded: false, isWriterLoaded: false });
  });

  test("parses columns and rows from xlsx", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const file = await createXlsxFile(dataSource);
    const { columns, rows } = await deserializeXlsx(file, defaultSettings);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(columns).type).toBe(ColumnType.Number);
    expect(takeOne(columns, 1).name).toBe("b");
    expect(rows).toHaveLength(2);
    expect(takeOne(rows).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")]);
    const file = await createXlsxFile(dataSource);
    const { columns, metadata, rows } = await deserializeXlsx(file, defaultSettings);

    expect(columns).toHaveLength(2);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Xlsx);
  });
});
