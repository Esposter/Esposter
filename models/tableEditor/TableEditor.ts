import type { Item } from "@/models/tableEditor/Item";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "@/utils/validation";
import { z } from "zod";

export class TableEditor<T extends Item> {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodTypeAny = z.ZodType<Item>>(schema: T) =>
  z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
