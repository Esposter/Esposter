import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { serializeToMarkdown } from "@/services/tableEditor/file/commands/serializeToMarkdown";

export const copyToClipboard = (dataSource: DataSource, rowIds?: string[]): Promise<void> => {
  const visibleColumns = dataSource.columns.filter((column) => !column.hidden);
  const rowIdSet = rowIds ? new Set(rowIds) : null;
  const rows = rowIdSet ? dataSource.rows.filter((row) => rowIdSet.has(row.id)) : dataSource.rows;
  return navigator.clipboard.writeText(serializeToMarkdown({ ...dataSource, columns: visibleColumns, rows }));
};
