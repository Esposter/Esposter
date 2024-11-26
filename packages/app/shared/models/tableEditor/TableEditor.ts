import type { Item } from "@/shared/models/tableEditor/Item";

import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "@/services/tableEditor/constants";
import { z } from "zod";

export class TableEditor<T extends Item> {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodType<Item>>(schema: T) =>
  z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
