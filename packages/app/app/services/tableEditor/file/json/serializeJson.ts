import type { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const serializeJson = (dataSource: DataSource, _item: JsonDataSourceItem, mimeType: string): Promise<Blob> => {
  const rows = dataSource.rows.map((row) =>
    Object.fromEntries(dataSource.columns.map((column) => [column.name, row[column.name] ?? null])),
  );
  return Promise.resolve(new Blob([JSON.stringify(rows, null, 2)], { type: mimeType }));
};
