import { IItem, iItemSchema } from "@/models/tableEditor/IItem";
import { z } from "zod";

export class TableEditor {
  items: IItem[] = [];
}

export const tableEditorSchema = z.object({ items: z.array(iItemSchema) }) satisfies z.ZodType<TableEditor>;
