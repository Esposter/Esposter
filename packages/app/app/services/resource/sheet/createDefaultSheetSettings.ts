import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { exhaustiveGuard } from "@esposter/shared";

export const createDefaultSheetSettings = (type: DataSourceType): SheetSettings => {
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
