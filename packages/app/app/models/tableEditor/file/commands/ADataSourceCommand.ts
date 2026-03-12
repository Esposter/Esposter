import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { syncStats } from "@/services/tableEditor/file/syncStats";

export abstract class ADataSourceCommand extends AItemEntity {
  abstract readonly name: string;
  abstract get description(): string;

  execute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    this.doExecute(item);
    if (item.dataSource) syncStats(item.dataSource);
  }

  undo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    this.doUndo(item);
    if (item.dataSource) syncStats(item.dataSource);
  }

  protected abstract doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]): void;
  protected abstract doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]): void;
}
