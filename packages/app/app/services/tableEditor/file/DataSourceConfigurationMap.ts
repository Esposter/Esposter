import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import { deserializeCsv } from "@/services/tableEditor/file/csv/deserializeCsv";
import { serializeCsv } from "@/services/tableEditor/file/csv/serializeCsv";
import { deserializeXlsx } from "@/services/tableEditor/file/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";
import { lookup } from "mime-types";

export const DataSourceConfigurationMap = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    deserialize: deserializeCsv,
    mimeType: lookup(".csv") || "",
    schema: csvDataSourceConfigurationSchema,
    serialize: serializeCsv,
  },
  [DataSourceType.Xlsx]: {
    accept: ".xlsx",
    deserialize: deserializeXlsx,
    mimeType: lookup(".xlsx") || "",
    schema: xlsxDataSourceConfigurationSchema,
    serialize: serializeXlsx,
  },
} as const satisfies {
  [P in keyof DataSourceItemTypeMap]: DataSourceConfiguration<DataSourceItemTypeMap[P]>;
};
