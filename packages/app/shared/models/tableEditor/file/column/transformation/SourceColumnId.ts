import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { z } from "zod";

export interface SourceColumnId {
  sourceColumnId: string;
}

export const createSourceColumnIdSchema = (
  getItems: keyof typeof ColumnFormVjsfContextPropertyNames = ColumnFormVjsfContextPropertyNames["context.columnItems"],
) =>
  z.object({
    sourceColumnId: z.string().meta({
      comp: "select",
      getItems,
      title: "Source Column",
    }),
  }) satisfies z.ZodType<SourceColumnId>;
