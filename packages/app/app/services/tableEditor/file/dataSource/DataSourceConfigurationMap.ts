import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/dataSource/DataSourceConfiguration";

import { MimeType } from "#shared/models/file/MimeType";
import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { jsonDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/json/JsonDataSourceConfiguration";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import { deserializeCsv } from "@/services/tableEditor/file/csv/deserializeCsv";
import { serializeCsv } from "@/services/tableEditor/file/csv/serializeCsv";
import { deserializeJson } from "@/services/tableEditor/file/json/deserializeJson";
import { serializeJson } from "@/services/tableEditor/file/json/serializeJson";
import { deserializeXlsx } from "@/services/tableEditor/file/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";

export const DataSourceConfigurationMap: Record<
  DataSourceType,
  DataSourceConfiguration<DataSourceItem>
> = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    deserialize: deserializeCsv,
    mimeType: MimeType.Csv,
    schema: csvDataSourceConfigurationSchema,
    serialize: serializeCsv,
  },
  [DataSourceType.Json]: {
    accept: ".json",
    deserialize: deserializeJson,
    mimeType: MimeType.Json,
    schema: jsonDataSourceConfigurationSchema,
    serialize: serializeJson,
  },
  [DataSourceType.Xlsx]: {
    accept: ".xlsx",
    deserialize: deserializeXlsx,
    mimeType: MimeType.Xlsx,
    schema: xlsxDataSourceConfigurationSchema,
    serialize: serializeXlsx,
  },
};
