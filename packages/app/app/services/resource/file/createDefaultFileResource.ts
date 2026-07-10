import type { FileResource } from "#shared/models/resource/file/FileResource";

import { CsvDelimiter } from "#shared/models/resource/file/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
// The content blob is written on first save, so a fresh File resource starts from this default shape
export const createDefaultFileResource = (): FileResource => ({
  data: {
    columns: [],
    metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
    rows: [],
    statistics: { columnCount: 0, rowCount: 0, size: 0 },
  },
  settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
});
