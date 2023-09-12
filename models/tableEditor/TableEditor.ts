import type { Item } from "@/models/tableEditor/Item";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "@/utils/validation";
import { z } from "zod";

export class TableEditor<T extends Item> {
  items: T[] = [];
}

// Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(TableEditor);

export const createTableEditorSchema = <T extends z.ZodTypeAny = z.ZodType<Item>>(schema: T) =>
  z.object({ items: z.array(schema).max(TABLE_EDITOR_ITEMS_MAX_LENGTH) });
