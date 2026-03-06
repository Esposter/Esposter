import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { DataSourceType, dataSourceTypeSchema } from "#shared/models/tableEditor/file/DataSourceType";
import { z } from "zod";

export abstract class ADataSourceItem<TDataSourceType extends DataSourceType>
  extends ATableEditorItemEntity
  implements ItemEntityType<TDataSourceType>
{
  abstract readonly type: TDataSourceType;
}

export const aDataSourceItemSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  type: dataSourceTypeSchema,
});
