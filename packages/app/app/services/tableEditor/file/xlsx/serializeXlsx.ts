import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

import writeXlsxFile from "write-excel-file/browser";

export const serializeXlsx = (dataSource: DataSource, _item: XlsxDataSourceItem, _mimeType: string): Promise<Blob> => {
  const headerRow = dataSource.columns.map((column) => column.name);
  const dataRows = dataSource.rows.map((row) => dataSource.columns.map((column) => row.data[column.name] ?? null));
  return writeXlsxFile([headerRow, ...dataRows], {});
};
