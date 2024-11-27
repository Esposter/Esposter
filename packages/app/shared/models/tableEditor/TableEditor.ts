import type { Item } from "@/shared/models/tableEditor/Item";
import type { Except } from "type-fest";

import { Serializable } from "@/shared/models/entity/Serializable";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "@/shared/services/tableEditor/constants";
import { z } from "zod";

export class TableEditor<T extends Except<Item, "toJSON">> extends Serializable {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodType<Except<Item, "toJSON">>>(schema: T) =>
  z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
