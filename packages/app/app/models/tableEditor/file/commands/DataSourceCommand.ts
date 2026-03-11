import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface DataSourceCommand {
  execute: (item: ADataSourceItem<DataSourceType>) => void;
  undo: (item: ADataSourceItem<DataSourceType>) => void;
}
