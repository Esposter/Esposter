import { Item, itemSchema } from "@/models/tableEditor/Item";
import { z } from "zod";

export class TableEditor {
  items: Item[] = [];
}

export const tableEditorSchema = z.object({ items: z.array(itemSchema) }) satisfies z.ZodType<TableEditor>;
