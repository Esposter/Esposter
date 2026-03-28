import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { z } from "zod";

export interface SourceColumnIds {
  sourceColumnIds: string[];
}

export const createSourceColumnIdsSchema = (getItems = ColumnFormVjsfContextPropertyNames["context.columnItems"]) =>
  z.object({
    sourceColumnIds: z
      .array(
        z.string().meta({
          comp: "select",
          getItems,
          title: "Source Column",
        }),
      )
      .meta({ title: "Source Columns" }),
  }) satisfies z.ZodType<SourceColumnIds>;
