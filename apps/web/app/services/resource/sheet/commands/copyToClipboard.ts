import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { CopyToClipboardOptions } from "@/models/resource/sheet/commands/CopyToClipboardOptions";

import { MimeType } from "#shared/models/file/MimeType";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { getCellTextRows } from "@/services/resource/sheet/commands/getCellTextRows";
import { serializeToHtml } from "@/services/resource/sheet/commands/serializeToHtml";
import { serializeToTsv } from "@/services/resource/sheet/commands/serializeToTsv";

export const copyToClipboard = async (dataSource: DataSource, options: CopyToClipboardOptions = {}): Promise<void> => {
  const { includeHeaders = true, rowIds } = options;
  const visibleColumns = getVisibleColumns(dataSource.columns);
  const rowIdSet = rowIds ? new Set(rowIds) : undefined;
  const rows = rowIdSet ? dataSource.rows.filter((row) => rowIdSet.has(row.id)) : dataSource.rows;
  const filteredDataSource = { ...dataSource, columns: visibleColumns, rows };
  const cellTextRows = getCellTextRows(visibleColumns, rows);
  const tsv = serializeToTsv(filteredDataSource, includeHeaders, cellTextRows);
  // Not wrapped: the caller already terminates and alerts, so a handler here would have nothing to do but rethrow
  if (typeof ClipboardItem === "undefined") {
    await window.navigator.clipboard.writeText(tsv);
    return;
  }

  const tsvBlob = new Blob([tsv], { type: MimeType.PlainText });
  const htmlBlob = new Blob([serializeToHtml(filteredDataSource, includeHeaders, cellTextRows)], {
    type: MimeType.Html,
  });
  await window.navigator.clipboard.write([
    new ClipboardItem({ [MimeType.Html]: htmlBlob, [MimeType.PlainText]: tsvBlob }),
  ]);
};
