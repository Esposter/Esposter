// @vitest-environment happy-dom
// The `read-excel-file` parser reads the workbook XML with DOMParser, which only a DOM environment supplies
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { deserializeXlsx } from "@/services/resource/sheet/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/resource/sheet/xlsx/serializeXlsx";
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

    expect(columns.map(({ name, type }) => ({ name, type }))).toStrictEqual([
      { name: "a", type: ColumnType.Number },
      { name: "b", type: ColumnType.Number },
    ]);
    expect(rows.map(({ data }) => data)).toStrictEqual([
      { a: 0, b: 1 },
      { a: 2, b: 3 },
    ]);
  });

  // A date-styled cell is read back as a Date, so the test writes one with its own number format rather than a string
  const createDateCellFile = async (value: Date | number, format: string) => {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    const blob = await writeXlsxFile([["a"], [{ format, value }]]).toBlob();
    return new File([blob], "a.xlsx", { type: MIME_TYPE });
  };

  test("reads a date-styled cell as a date column", async () => {
    expect.hasAssertions();

    const epochDate = new Date(0).toISOString().slice(0, 10);
    const file = await createDateCellFile(new Date(0), "yyyy-mm-dd");
    const { columns, rows } = await deserializeXlsx(file, defaultSettings);

    expect(columns.map(({ name, type }) => ({ name, type }))).toStrictEqual([{ name: "a", type: ColumnType.Date }]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: epochDate }]);
  });

  test("keeps the time of a date-styled cell that has one", async () => {
    expect.hasAssertions();

    const epochDate = new Date(0).toISOString().slice(0, 10);
    const tenHours = new Date(Temporal.Duration.from({ hours: 10 }).total("milliseconds"));
    const file = await createDateCellFile(tenHours, "yyyy-mm-dd hh:mm:ss");
    const { columns, rows } = await deserializeXlsx(file, defaultSettings);

    expect(columns.map(({ type }) => type)).toStrictEqual([ColumnType.Date]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: `${epochDate}T10:00:00` }]);
  });

  test("a date-styled cell outside the calendar does not fail the import", async () => {
    expect.hasAssertions();

    // A serial past the last day a Date can hold, which the reader hands over as an Invalid Date
    const outOfCalendarSerial = 1e10;
    const file = await createDateCellFile(outOfCalendarSerial, "yyyy-mm-dd");
    const { rows } = await deserializeXlsx(file, defaultSettings);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: "Invalid Date" }]);
  });

  test("only header row returns columns with no rows", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")]);
    const file = await createXlsxFile(dataSource);
    const { columns, metadata, rows } = await deserializeXlsx(file, defaultSettings);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "b"]);
    expect(rows).toStrictEqual([]);
    expect(metadata.dataSourceType).toBe(DataSourceType.Xlsx);
  });
});
