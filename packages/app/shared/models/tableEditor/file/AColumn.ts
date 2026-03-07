import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType, columnTypeSchema } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export abstract class AColumn extends ATableEditorItemEntity implements ItemEntityType<ColumnType> {
  readonly sourceName: string = "";
  readonly type: ColumnType = ColumnType.String;
}

export const aColumnSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  sourceName: z.string().readonly(),
  type: columnTypeSchema.readonly(),
});
