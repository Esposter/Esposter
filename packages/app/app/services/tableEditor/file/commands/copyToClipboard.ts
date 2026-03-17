import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const copyToClipboard = async (
  dataSource: DataSource,
  item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap],
  rowIds?: string[],
): Promise<void> => {
  if (item.type === DataSourceType.Xlsx)
    throw new InvalidOperationError(Operation.Read, "clipboard", "Clipboard copy is not supported for XLSX format");
  const visibleColumns = dataSource.columns.filter((column) => !column.hidden);
  const rows = rowIds ? dataSource.rows.filter((row) => rowIds.includes(row.id)) : dataSource.rows;
  const filteredDataSource = { ...dataSource, columns: visibleColumns, rows };
  const { mimeType, serialize } = DataSourceConfigurationMap[item.type];
  const blob = await serialize(filteredDataSource, item, mimeType);
  return navigator.clipboard.writeText(await blob.text());
};
