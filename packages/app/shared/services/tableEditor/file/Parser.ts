import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface Parser<TDataSourceItem extends ADataSourceItem<DataSourceType>> {
  parse(file: File, item: TDataSourceItem): Promise<DataSource>;
}
