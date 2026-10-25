import type { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { AItemEntity } from "#shared/models/entity/AItemEntity";

export abstract class ADataSourceCommand<T extends CommandType = CommandType>
  extends AItemEntity
  implements ItemEntityType<T>
{
  abstract readonly type: T;

  abstract get description(): string;

  abstract execute(dataSource: ToData<DataSource>): void;
  abstract undo(dataSource: ToData<DataSource>): void;
}
