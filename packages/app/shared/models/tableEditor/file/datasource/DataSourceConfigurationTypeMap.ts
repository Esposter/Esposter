import type { CsvDataSourceConfiguration } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import type { JsonDataSourceConfiguration } from "#shared/models/tableEditor/file/json/JsonDataSourceConfiguration";
import type { XlsxDataSourceConfiguration } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";

export interface DataSourceConfigurationTypeMap {
  [DataSourceType.Csv]: CsvDataSourceConfiguration;
  [DataSourceType.Json]: JsonDataSourceConfiguration;
  [DataSourceType.Xlsx]: XlsxDataSourceConfiguration;
}
