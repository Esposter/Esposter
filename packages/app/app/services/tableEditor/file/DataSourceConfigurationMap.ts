import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import { parseCsv } from "@/services/tableEditor/file/csv/parseCsv";
import { serializeCsv } from "@/services/tableEditor/file/csv/serializeCsv";
import { parseXlsx } from "@/services/tableEditor/file/xlsx/parseXlsx";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";

export const DataSourceConfigurationMap = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    deserialize: parseCsv,
    mimeType: "text/csv",
    schema: csvDataSourceConfigurationSchema,
    serialize: serializeCsv,
  },
  [DataSourceType.Xlsx]: {
    accept: ".xlsx",
    deserialize: parseXlsx,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    schema: xlsxDataSourceConfigurationSchema,
    serialize: serializeXlsx,
  },
} as const satisfies {
  [P in keyof DataSourceItemTypeMap]: DataSourceConfiguration<DataSourceItemTypeMap[P]>;
};
