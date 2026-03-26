import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DESCRIPTION_MAX_LENGTH } from "#shared/services/constants";
import { z } from "zod";

export abstract class AColumn<TColumnType extends ColumnType = ColumnType>
  extends ATableEditorItemEntity
  implements ItemEntityType<TColumnType>
{
  description = "";
  hidden = false;
  size = 0;
  readonly sourceName: string = "";
  abstract readonly type: TColumnType;

  constructor(init?: Partial<AColumn<TColumnType>>) {
    super();
    Object.assign(this, init);
  }
}

export const createAColumnSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  z.object({
    ...aTableEditorItemEntitySchema.shape,
    description: z.string().max(DESCRIPTION_MAX_LENGTH).default(""),
    hidden: z.boolean().default(false),
    size: z.number().default(0),
    sourceName: z.string().default("").readonly(),
    type: typeSchema.readonly(),
  });
