import type { Item } from "@/models/tableEditor/Item";
import { z } from "zod";

export class TableEditor<T extends Item> {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends z.ZodTypeAny = z.ZodType<Item>>(schema: T) =>
  z.object({ items: z.array(schema) });
