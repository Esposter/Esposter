import type { CsvDataSourceConfiguration } from "#shared/models/tableEditor/file/CsvDataSourceConfiguration";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface DataSourceConfigurationTypeMap {
  [DataSourceType.Csv]: CsvDataSourceConfiguration;
}
