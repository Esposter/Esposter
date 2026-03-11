import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { AItemEntity } from "#shared/models/entity/AItemEntity";

export abstract class ADataSourceCommand extends AItemEntity {
  abstract readonly name: string;
  abstract get description(): string;
  abstract execute(item: ADataSourceItem<DataSourceType>): void;
  abstract undo(item: ADataSourceItem<DataSourceType>): void;
}
