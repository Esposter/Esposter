import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { takeOne } from "@esposter/shared";

export const serializeXlsx = async (
  dataSource: DataSource,
  _settings: XlsxFileSettings,
  _mimeType: MimeType,
): Promise<Blob> => {
  // Same reason as the reader: the workbook writer is a per-format cost, not a per-resource-page one
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const headerRow = dataSource.columns.map((column) => column.name);
  const dataRows = dataSource.rows.map((row) => dataSource.columns.map((column) => takeOne(row.data, column.name)));
  return writeXlsxFile([headerRow, ...dataRows]).toBlob();
};
