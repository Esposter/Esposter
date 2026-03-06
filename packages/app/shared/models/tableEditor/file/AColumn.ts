import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType, columnTypeSchema } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export abstract class AColumn<TColumnType extends ColumnType>
  extends ATableEditorItemEntity
  implements ItemEntityType<TColumnType>
{
  readonly sourceName: string = "";
  abstract type: TColumnType;
}

export const aColumnSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  sourceName: z.string(),
  type: columnTypeSchema,
});
