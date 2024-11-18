import type { Item } from "@/models/tableEditor/Item";

import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "@/services/tableEditor/constants";
import { RegisterSuperJSON } from "@/shared/services/superjson/RegisterSuperJSON";
import { z } from "zod";

export
@RegisterSuperJSON
class TableEditor<T extends Item> {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodType<Item>>(schema: T) =>
  z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
