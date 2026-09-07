import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ItemEntityType } from "@esposter/shared";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";

export abstract class ADataSourceCommand<T extends CommandType = CommandType>
  extends AItemEntity
  implements ItemEntityType<T>
{
  abstract readonly type: T;

  abstract get description(): string;

  abstract execute(dataSource: DataSource): void;
  abstract undo(dataSource: DataSource): void;
}
