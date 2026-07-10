import type { FileSettings } from "#shared/models/resource/file/FileSettings";

import { CsvDelimiter } from "#shared/models/resource/file/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { exhaustiveGuard } from "@esposter/shared";

export const createDefaultFileSettings = (type: DataSourceType): FileSettings => {
  switch (type) {
    case DataSourceType.Csv:
      return { configuration: { delimiter: CsvDelimiter.Comma }, type };
    case DataSourceType.Json:
      return { configuration: {}, type };
    case DataSourceType.Xlsx:
      return { configuration: { sheetIndex: 0 }, type };
    default:
      return exhaustiveGuard(type);
  }
};
