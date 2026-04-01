import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { ItemEntityType } from "@esposter/shared";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { syncStatistics } from "@/services/tableEditor/file/commands/syncStatistics";

export abstract class ADataSourceCommand<T extends CommandType = CommandType>
  extends AItemEntity
  implements ItemEntityType<T>
{
  abstract readonly type: T;

  abstract get description(): string;

  execute(item: DataSourceItem) {
    this.doExecute(item);
    if (item.dataSource) syncStatistics(item.dataSource);
  }

  undo(item: DataSourceItem) {
    this.doUndo(item);
    if (item.dataSource) syncStatistics(item.dataSource);
  }

  protected abstract doExecute(item: DataSourceItem): void;
  protected abstract doUndo(item: DataSourceItem): void;
}
