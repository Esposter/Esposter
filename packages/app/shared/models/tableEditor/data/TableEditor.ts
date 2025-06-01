import type { ToData } from "#shared/models/entity/ToData";
import type { Item } from "#shared/models/tableEditor/data/Item";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { z } from "zod/v4";

export class TableEditor<T extends ToData<Item>> extends AItemEntity {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodType<ToData<Item>>>(schema: T) =>
  z.object({ ...aItemEntitySchema.shape, items: schema.array().max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
