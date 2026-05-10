import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { serializeToHtml } from "@/services/tableEditor/file/commands/serializeToHtml";
import { serializeToTsv } from "@/services/tableEditor/file/commands/serializeToTsv";
import { getResultAsync, noop } from "@esposter/shared";

interface CopyToClipboardOptions {
  includeHeaders?: boolean;
  rowIds?: string[];
}

export const copyToClipboard = async (dataSource: DataSource, options: CopyToClipboardOptions = {}): Promise<void> => {
  const { includeHeaders = true, rowIds } = options;
  const visibleColumns = dataSource.columns.filter((column) => !column.hidden);
  const rowIdSet = rowIds ? new Set(rowIds) : undefined;
  const rows = rowIdSet ? dataSource.rows.filter((row) => rowIdSet.has(row.id)) : dataSource.rows;
  const filteredDataSource = { ...dataSource, columns: visibleColumns, rows };
  const tsv = serializeToTsv(filteredDataSource, includeHeaders);
  await getResultAsync(async () => {
    if (typeof ClipboardItem === "undefined") {
      await window.navigator.clipboard.writeText(tsv);
      return;
    }

    const tsvBlob = new Blob([tsv], { type: "text/plain" });
    const htmlBlob = new Blob([serializeToHtml(filteredDataSource, includeHeaders)], { type: "text/html" });
    await window.navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": tsvBlob })]);
  }).match(noop, (error) => {
    throw error;
  });
};
