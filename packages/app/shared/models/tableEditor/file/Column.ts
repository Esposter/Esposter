import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType, columnTypeSchema } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class Column extends ATableEditorItemEntity implements ItemEntityType<ColumnType> {
  readonly sourceName: string = "";
  readonly type: ColumnType = ColumnType.String;

  constructor(init?: Partial<Column>) {
    super();
    Object.assign(this, init);
  }
}

export const columnSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  sourceName: z.string().readonly(),
  type: columnTypeSchema.readonly(),
});
