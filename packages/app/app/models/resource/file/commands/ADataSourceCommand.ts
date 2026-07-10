import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { ItemEntityType } from "@esposter/shared";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { CommandType } from "@/models/resource/file/commands/CommandType";
import { syncStatistics } from "@/services/resource/file/commands/syncStatistics";

export abstract class ADataSourceCommand<T extends CommandType = CommandType>
  extends AItemEntity
  implements ItemEntityType<T>
{
  abstract readonly type: T;

  abstract get description(): string;

  execute(dataSource: DataSource) {
    this.doExecute(dataSource);
    syncStatistics(dataSource);
  }

  undo(dataSource: DataSource) {
    this.doUndo(dataSource);
    syncStatistics(dataSource);
  }

  protected abstract doExecute(dataSource: DataSource): void;
  protected abstract doUndo(dataSource: DataSource): void;
}
