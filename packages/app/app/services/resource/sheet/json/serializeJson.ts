import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { JsonFileSettings } from "#shared/models/resource/sheet/JsonFileSettings";

import { takeOne } from "@esposter/shared";

export const serializeJson = (
  dataSource: DataSource,
  _settings: JsonFileSettings,
  mimeType: MimeType,
): Promise<Blob> => {
  const rows = dataSource.rows.map((row) =>
    Object.fromEntries(dataSource.columns.map((column) => [column.name, takeOne(row.data, column.name)])),
  );
  return Promise.resolve(new Blob([JSON.stringify(rows, null, 2)], { type: mimeType }));
};
