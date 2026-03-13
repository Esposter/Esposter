import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { ItemEntityType } from "@esposter/shared";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { syncStats } from "@/services/tableEditor/file/syncStats";

export abstract class ADataSourceCommand<T extends CommandType = CommandType>
  extends AItemEntity
  implements ItemEntityType<T>
{
  abstract readonly type: T;

  abstract get description(): string;

  get name() {
    return this.type;
  }

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
