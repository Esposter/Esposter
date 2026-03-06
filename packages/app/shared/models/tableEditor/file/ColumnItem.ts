import type { ItemEntityType, ToData } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType, columnTypeSchema } from "#shared/models/tableEditor/file/ColumnType";
import { DataSourceType, dataSourceTypeSchema } from "#shared/models/tableEditor/file/DataSourceType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export class ColumnItem extends ATableEditorItemEntity implements ItemEntityType<ColumnType> {
  dataSourceType = DataSourceType.Csv;
  readonly sourceName: string = "";
  type = ColumnType.String;

  constructor(init?: Partial<ColumnItem>) {
    super();
    Object.assign(this, init);
  }
}

export const columnItemSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  ...createItemEntityTypeSchema(columnTypeSchema).shape,
  dataSourceType: dataSourceTypeSchema,
  sourceName: z.string(),
}) satisfies z.ZodType<ToData<ColumnItem>>;
