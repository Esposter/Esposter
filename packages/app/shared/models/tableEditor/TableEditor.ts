import type { ToData } from "#shared/models/entity/ToData";
import type { Item } from "#shared/models/tableEditor/Item";

import { Serializable } from "#shared/models/entity/Serializable";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { z } from "zod";

export class TableEditor<T extends ToData<Item>> extends Serializable {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodType<ToData<Item>>>(schema: T) =>
  z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
