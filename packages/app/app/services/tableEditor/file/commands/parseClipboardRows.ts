import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Row } from "#shared/models/tableEditor/file/Row";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";

export const parseClipboardRows = async (
  text: string,
  dataSource: DataSource,
  item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap],
): Promise<DataSource["rows"]> => {
  const { deserialize, mimeType } = DataSourceConfigurationMap[item.type];
  const file = new File([text], "clipboard", { type: mimeType });
  const newDataSource = await deserialize(file, item);
  return newDataSource.rows.map(
    (newRow) =>
      new Row({
        data: Object.fromEntries(
          dataSource.columns.map((column) => [
            column.name,
            coerceValue(String(newRow.data[column.name] ?? ""), column.type),
          ]),
        ),
      }),
  );
};
