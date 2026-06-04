import type { Item } from "#shared/models/tableEditor/data/Item";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class TableEditor<T extends ToData<Item>> extends AItemEntity {
  items: T[] = [];

  constructor(init?: Partial<TableEditor<T>>) {
    super();
    Object.assign(this, init);
  }
}

export const createTableEditorSchema = <T extends z.ZodType<ToData<Item>>>(schema: T) =>
  z.object({ ...aItemEntitySchema.shape, items: createUniqueArraySchema(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
