import type { ToData } from "#shared/models/entity/ToData";
import type { Item } from "#shared/models/tableEditor/Item";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { z } from "zod";

export class TableEditor<T extends ToData<Item>> extends AItemEntity {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends ToData<Item>>(schema: z.ZodType<T>) =>
  aItemEntitySchema.extend(z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) }));
