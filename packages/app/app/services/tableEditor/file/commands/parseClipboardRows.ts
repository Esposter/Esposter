import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Row } from "#shared/models/tableEditor/file/Row";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export const parseClipboardRows = async (
  text: string,
  dataSource: DataSource,
  item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap],
): Promise<DataSource["rows"]> => {
  if (item.dataSourceType === DataSourceType.Xlsx)
    throw new InvalidOperationError(Operation.Read, "clipboard", "Clipboard paste is not supported for XLSX format");
  const { mimeType, deserialize } = DataSourceConfigurationMap[item.dataSourceType];
  const file = new File([text], "clipboard", { type: mimeType });
  const newDataSource = await deserialize(file, item);
  const columnByNameMap = new Map(dataSource.columns.map((column) => [column.name.toLowerCase(), column]));
  return newDataSource.rows.map((newRow) => {
    const row = new Row();
    for (const column of dataSource.columns) row.data[column.name] = null;
    for (const newColumn of newDataSource.columns) {
      const existingColumn = columnByNameMap.get(newColumn.name.toLowerCase());
      if (!existingColumn) continue;
      const value = takeOne(newRow.data, newColumn.name);
      row.data[existingColumn.name] = coerceValue(value === null ? "" : String(value), existingColumn.type);
    }
    return row;
  });
};
