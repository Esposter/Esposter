import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceConfigurationTypeMap } from "#shared/models/tableEditor/file/DataSourceConfigurationTypeMap";
import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { dataSourceSchema } from "#shared/models/tableEditor/file/DataSource";
import { z } from "zod";

export abstract class ADataSourceItem<TDataSourceType extends keyof DataSourceConfigurationTypeMap>
  extends ATableEditorItemEntity
  implements ItemEntityType<TDataSourceType>
{
  abstract configuration: DataSourceConfigurationTypeMap[TDataSourceType];
  dataSource: DataSource | null = null;
  abstract readonly type: TDataSourceType;
}

export const createDataSourceItemSchema = <
  TType extends z.ZodType<keyof DataSourceConfigurationTypeMap>,
  TConfiguration extends z.ZodType<object>,
>(
  typeSchema: TType,
  configurationSchema: TConfiguration,
) =>
  z.object({
    ...aTableEditorItemEntitySchema.shape,
    configuration: configurationSchema,
    dataSource: dataSourceSchema.nullable(),
    type: typeSchema.readonly(),
  });
