import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { syncStats } from "@/services/tableEditor/file/syncStats";

export abstract class ADataSourceCommand extends AItemEntity {
  abstract readonly name: string;
  abstract get description(): string;

  execute(item: ADataSourceItem<DataSourceType>) {
    this.doExecute(item);
    if (item.dataSource) syncStats(item.dataSource);
  }

  undo(item: ADataSourceItem<DataSourceType>) {
    this.doUndo(item);
    if (item.dataSource) syncStats(item.dataSource);
  }

  protected abstract doExecute(item: ADataSourceItem<DataSourceType>): void;
  protected abstract doUndo(item: ADataSourceItem<DataSourceType>): void;
}
