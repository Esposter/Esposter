import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { serializeToHtml } from "@/services/tableEditor/file/commands/serializeToHtml";
import { serializeToTsv } from "@/services/tableEditor/file/commands/serializeToTsv";

export const copyToClipboard = async (dataSource: DataSource, rowIds?: string[]): Promise<void> => {
  const visibleColumns = dataSource.columns.filter((column) => !column.hidden);
  const rowIdSet = rowIds ? new Set(rowIds) : undefined;
  const rows = rowIdSet ? dataSource.rows.filter((row) => rowIdSet.has(row.id)) : dataSource.rows;
  const filteredDataSource = { ...dataSource, columns: visibleColumns, rows };
  const tsv = serializeToTsv(filteredDataSource);
  if (typeof ClipboardItem === "undefined") {
    await window.navigator.clipboard.writeText(tsv);
    return;
  }
  const tsvBlob = new Blob([tsv], { type: "text/plain" });
  const htmlBlob = new Blob([serializeToHtml(filteredDataSource)], { type: "text/html" });
  await window.navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": tsvBlob })]);
};
